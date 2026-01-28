import json
from pathlib import Path
from datetime import datetime
import sys

# Fix encoding for Windows console
sys.stdout.reconfigure(encoding='utf-8')

# Config files to simulate
script_dir = Path(__file__).parent
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

def simulate_config_provisioning(config_data, config_name):
    """
    Dry-run simulation of config provisioning.
    Simulates the POST /internal/simulate-config endpoint behavior.
    """
    result = {
        "config_id": config_data.get("id"),
        "config_name": config_name,
        "status": "PASS",
        "checks": [],
        "warnings": [],
        "errors": []
    }
    
    # Simulate various provisioning checks
    
    # Check 1: Base capital validation
    base_capital = config_data.get("baseCapital", 0)
    if base_capital >= 1000:
        result["checks"].append({
            "check": "BaseCapitalValidation",
            "status": "PASS",
            "message": f"Base capital ${base_capital:,} is valid"
        })
    else:
        result["checks"].append({
            "check": "BaseCapitalValidation",
            "status": "FAIL",
            "message": f"Base capital ${base_capital:,} below minimum"
        })
        result["status"] = "FAIL"
        result["errors"].append("Insufficient base capital")
    
    # Check 2: Challenge definitions structure
    challenge_defs = config_data.get("challengeDefinitions", [])
    if challenge_defs:
        result["checks"].append({
            "check": "ChallengeDefinitionsPresent",
            "status": "PASS",
            "message": f"{len(challenge_defs)} challenge(s) defined"
        })
    else:
        result["checks"].append({
            "check": "ChallengeDefinitionsPresent",
            "status": "FAIL",
            "message": "No challenge definitions found"
        })
        result["status"] = "FAIL"
        result["errors"].append("Missing challenge definitions")
    
    # Check 3: Payout rules validation
    payout_rules = config_data.get("payoutRules", {})
    staged_payouts = payout_rules.get("stagedPayouts", [])
    if staged_payouts:
        total_payout = sum(p.get("payoutPercent", 0) for p in staged_payouts)
        if total_payout == 100:
            result["checks"].append({
                "check": "PayoutPercentageSum",
                "status": "PASS",
                "message": "Payout percentages sum to 100%"
            })
        else:
            result["checks"].append({
                "check": "PayoutPercentageSum",
                "status": "WARNING",
                "message": f"Payout percentages sum to {total_payout}% (expected 100%)"
            })
            result["warnings"].append(f"Unusual payout total: {total_payout}%")
    
    # Check 4: Variant-specific validations
    variant = config_data.get("variant", "")
    if variant == "straight-to-funded":
        # Straight-to-funded should have 1 challenge with durationDays = 0
        if len(challenge_defs) == 1 and challenge_defs[0].get("durationDays") == 0:
            result["checks"].append({
                "check": "StraightToFundedStructure",
                "status": "PASS",
                "message": "Straight-to-funded structure is correct"
            })
        else:
            result["warnings"].append("Straight-to-funded structure may be incorrect")
    elif variant == "evaluation":
        # Evaluation should have multiple challenges
        if len(challenge_defs) >= 2:
            result["checks"].append({
                "check": "EvaluationStructure",
                "status": "PASS",
                "message": f"Evaluation has {len(challenge_defs)} stages"
            })
        else:
            result["warnings"].append("Evaluation typically has 2+ stages")
    
    # Check 5: Risk parameters validation
    for idx, challenge in enumerate(challenge_defs):
        rules = challenge.get("rules", {})
        max_dd = rules.get("maxDrawdown", 0)
        daily_loss = rules.get("dailyLossLimit", 0)
        
        if daily_loss > max_dd:
            result["warnings"].append(
                f"Challenge '{challenge.get('name')}': Daily loss limit exceeds max drawdown"
            )
    
    return result

print("=" * 70)
print("Account Config Dry-Run Provisioning Simulation")
print("=" * 70)

simulation_results = []

for config_file in config_files:
    config_path = Path(config_file)
    config_name = config_path.name
    
    try:
        config_data = json.loads(config_path.read_text(encoding='utf-8'))
        
        print(f"\n🔄 Simulating: {config_name}")
        result = simulate_config_provisioning(config_data, config_name)
        
        simulation_results.append(result)
        
        # Print result summary
        if result["status"] == "PASS":
            print(f"   ✅ Status: {result['status']}")
        else:
            print(f"   ❌ Status: {result['status']}")
        
        print(f"   📋 Checks: {len(result['checks'])} performed")
        
        if result["warnings"]:
            print(f"   ⚠️  Warnings: {len(result['warnings'])}")
            for warning in result["warnings"]:
                print(f"      - {warning}")
        
        if result["errors"]:
            print(f"   ❌ Errors: {len(result['errors'])}")
            for error in result["errors"]:
                print(f"      - {error}")
    
    except Exception as e:
        simulation_results.append({
            "config_id": "unknown",
            "config_name": config_name,
            "status": "ERROR",
            "checks": [],
            "warnings": [],
            "errors": [str(e)]
        })
        print(f"   ❌ ERROR: {str(e)}")

print("\n" + "=" * 70)
passed = len([r for r in simulation_results if r["status"] == "PASS"])
print(f"Summary: {passed}/{len(config_files)} configs passed simulation")
print("=" * 70)

# Save simulation results
output = {
    "timestamp": datetime.now().isoformat(),
    "simulation_type": "dry-run",
    "endpoint": "POST /internal/simulate-config",
    "total_configs": len(config_files),
    "passed": passed,
    "failed": len([r for r in simulation_results if r["status"] == "FAIL"]),
    "errors": len([r for r in simulation_results if r["status"] == "ERROR"]),
    "results": simulation_results
}

(script_dir / "simulation-results.json").write_text(
    json.dumps(output, indent=2),
    encoding='utf-8'
)

print(f"\n✅ Simulation results saved to: agent/configs/simulation-results.json")
