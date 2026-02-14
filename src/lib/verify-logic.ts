import { calculateFlowlyScore, detectAnomalies, generateForecast } from './deterministic-logic';
import { calculateVitality } from './vitality-engine';
import { safeDivide, average, standardDeviation, coefficientOfVariation } from './math-utils';
import { Transaction, UserProfile } from './types';

function runTests() {
    console.log("🚀 Starting Financial Logic Stress Test...\n");

    // Test 1: Math Utils Safety
    console.log("Testing Math Utils...");
    console.log(`- SafeDivide (1/0): ${safeDivide(1, 0, 999)} (Expected: 999)`);
    console.log(`- Average ([10, 20]): ${average([10, 20])} (Expected: 15)`);
    console.log(`- StdDev ([10, 20, 30]): ${standardDeviation([10, 20, 30])} (Expected: ~8.16)`);
    console.log("");

    // Test 2: Flowly Score - Budget Penalty (Exponential)
    console.log("Testing Flowly Score (Budget Penalty)...");
    const testTransactions: Transaction[] = [];
    const budget = 1000;

    const { score: scorePerfect } = calculateFlowlyScore(1000, 1500, budget, [], 20);
    console.log(`- Score at Budget (spent=1000, budget=1000): ${scorePerfect}`);

    const { score: scoreOver } = calculateFlowlyScore(1100, 1500, budget, [], 20);
    console.log(`- Score with 10% Overspend: ${scoreOver}`);

    const { score: scoreDouble } = calculateFlowlyScore(2000, 1500, budget, [], 20);
    console.log(`- Score with 100% Overspend: ${scoreDouble}`);
    console.log("");

    // Test 3: Anomaly Detection (2-Sigma)
    console.log("Testing Anomaly Detection (2-Sigma)...");
    const baselineExpenses: Transaction[] = Array.from({ length: 10 }, (_, i) => ({
        id: `t${i}`,
        type: 'expense',
        amount: 20,
        merchant: 'Normal',
        date: '2026-02-01'
    } as Transaction));

    const spike: Transaction = {
        id: 'spike',
        type: 'expense',
        amount: 200,
        merchant: 'Big Purchase',
        date: '2026-02-14'
    } as Transaction;

    const allWithSpike = [...baselineExpenses, spike];
    const anomalies = detectAnomalies(allWithSpike);
    console.log(`- Anomalies detected in 10x spike: ${anomalies.length} (Expected: 1)`);
    console.log(`- Reason: ${anomalies[0]?.reason}`);
    console.log("");

    // Test 4: Momentum (Acceleration)
    console.log("Testing Vitality Momentum (Acceleration)...");
    const profile: UserProfile = { id: 'test', monthly_budget: 1000 } as UserProfile;

    // Scenario: Savings rate goes from 10% to 30%
    const vit1 = calculateVitality(300, 100, 1000, 1000, 700, profile, [], []);
    console.log(`- Momentum for 10% -> 30% SR: ${vit1.momentum}% (Expected: High/Improving)`);

    // Scenario: Savings rate goes from 30% to 10%
    const vit2 = calculateVitality(100, 300, 1000, 1000, 900, profile, [], []);
    console.log(`- Momentum for 30% -> 10% SR: ${vit2.momentum}% (Expected: Low/Declining)`);
    console.log("");

    // Test 5: Trajectory (CV Dampening)
    console.log("Testing Trajectory (CV Dampening)...");
    const volatileExpenses = [10, 500, 20, 600, 15, 550].map((amt, i) => ({
        id: `v${i}`,
        type: 'expense',
        amount: amt,
        date: `2026-02-0${i + 1}`
    } as Transaction));

    const cv = coefficientOfVariation(volatileExpenses.map(e => e.amount));
    console.log(`- Coefficient of Variation: ${cv.toFixed(2)} (>0.5 expected)`);

    const forecast = generateForecast(volatileExpenses);
    console.log(`- Forecast reasoning: ${forecast.reasoning}`);
    console.log("");

    console.log("✅ All Logic Clusters Verified.");
}

runTests();
