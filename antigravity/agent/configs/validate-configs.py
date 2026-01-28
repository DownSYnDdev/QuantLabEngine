import json
import sys
from pathlib import Path

# Fix encoding for Windows console
sys.stdout.reconfigure(encoding='utf-8')

# Load the schema
script_dir = Path(__file__).parent
schema_path = script_dir.parent / "docs" / "account-schema.md"
schema_content = schema_path.read_text(encoding='utf-8')
schema_match = schema_content.split('```json\n')[1].split('\n```')[0]
schema = json.loads(schema_match)

# Config files to validate
config_files = [
    script_dir / "25k-eval-v1.json",
    script_dir / "25k-straight-v1.json",
    script_dir / "50k-eval-v1.json",
    script_dir / "50k-straight-v1.json",
    script_dir / "100k-eval-v1.json",
    script_dir / "100k-straight-v1.json",
    script_dir / "150k-eval-v1.json",
    script_dir / "150k-straight-v1.json",
]

validation_results = []
all_valid = True

def validate_config(config_data, schema):
    """Basic validation against schema required fields and types"""
    errors = []
    
    # Check required fields
    required_fields = schema.get("required", [])
    for field in required_fields:
        if field not in config_data:
            errors.append(f"Missing required field: {field}")
    
    # Check variant enum
    if "variant" in config_data:
        allowed_variants = schema["properties"]["variant"]["enum"]
        if config_data["variant"] not in allowed_variants:
            errors.append(f"Invalid variant: {config_data['variant']}")
    
    # Check baseCapital minimum
    if "baseCapital" in config_data:
        min_capital = schema["properties"]["baseCapital"]["minimum"]
        if config_data["baseCapital"] < min_capital:
            errors.append(f"baseCapital {config_data['baseCapital']} below minimum {min_capital}")
    
    # Check challengeDefinitions structure
    if "challengeDefinitions" in config_data:
        for idx, challenge in enumerate(config_data["challengeDefinitions"]):
            if "id" not in challenge:
                errors.append(f"challengeDefinitions[{idx}] missing 'id'")
            if "name" not in challenge:
                errors.append(f"challengeDefinitions[{idx}] missing 'name'")
            if "rules" not in challenge:
                errors.append(f"challengeDefinitions[{idx}] missing 'rules'")
    
    # Check payoutRules structure
    if "payoutRules" in config_data:
        payout_rules = config_data["payoutRules"]
        if "stagedPayouts" in payout_rules:
            for idx, payout in enumerate(payout_rules["stagedPayouts"]):
                if "milestone" not in payout:
                    errors.append(f"payoutRules.stagedPayouts[{idx}] missing 'milestone'")
                if "payoutPercent" not in payout:
                    errors.append(f"payoutRules.stagedPayouts[{idx}] missing 'payoutPercent'")
                elif not (0 <= payout["payoutPercent"] <= 100):
                    errors.append(f"payoutRules.stagedPayouts[{idx}] payoutPercent out of range [0, 100]")
    
    return errors

print("=" * 60)
print("Account Config Validation Report")
print("=" * 60)

for config_file in config_files:
    config_path = Path(config_file)
    config_name = config_path.name
    
    try:
        # Load and parse JSON
        config_data = json.loads(config_path.read_text(encoding='utf-8'))
        
        # Validate against schema
        errors = validate_config(config_data, schema)
        
        if errors:
            all_valid = False
            status = "FAILED"
            validation_results.append({
                "file": config_name,
                "status": "FAILED",
                "errors": errors
            })
            print(f"\n❌ {config_name}: FAILED")
            for error in errors:
                print(f"   - {error}")
        else:
            status = "PASSED"
            validation_results.append({
                "file": config_name,
                "status": "PASSED",
                "errors": []
            })
            print(f"\n✅ {config_name}: PASSED")
    
    except json.JSONDecodeError as e:
        all_valid = False
        validation_results.append({
            "file": config_name,
            "status": "FAILED",
            "errors": [f"JSON parse error: {str(e)}"]
        })
        print(f"\n❌ {config_name}: FAILED - Invalid JSON")
        print(f"   - {str(e)}")
    except Exception as e:
        all_valid = False
        validation_results.append({
            "file": config_name,
            "status": "FAILED",
            "errors": [f"Unexpected error: {str(e)}"]
        })
        print(f"\n❌ {config_name}: FAILED - Unexpected error")
        print(f"   - {str(e)}")

print("\n" + "=" * 60)
print(f"Summary: {len([r for r in validation_results if r['status'] == 'PASSED'])}/{len(config_files)} configs passed")
print("=" * 60)

# Save validation results
results_json = {
    "timestamp": "2026-01-27T09:49:00-08:00",
    "schema_version": "draft-07",
    "total_configs": len(config_files),
    "passed": len([r for r in validation_results if r['status'] == 'PASSED']),
    "failed": len([r for r in validation_results if r['status'] == 'FAILED']),
    "results": validation_results
}

(script_dir / "validation-results.json").write_text(
    json.dumps(results_json, indent=2),
    encoding='utf-8'
)

if all_valid:
    print("\n✅ All configurations are valid!")
    sys.exit(0)
else:
    print("\n❌ Some configurations failed validation")
    
    # Create validation-errors.txt if there are errors
    error_lines = ["Account Config Validation Errors\n", "=" * 60 + "\n\n"]
    for result in validation_results:
        if result["status"] == "FAILED":
            error_lines.append(f"File: {result['file']}\n")
            for error in result['errors']:
                error_lines.append(f"  - {error}\n")
            error_lines.append("\n")
    
    (script_dir / "validation-errors.txt").write_text(
        "".join(error_lines),
        encoding='utf-8'
    )
    sys.exit(1)
