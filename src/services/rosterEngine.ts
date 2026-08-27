import {
  Employee,
  StaffingNorm,
  LeaveRecord,
  RosterAssignment,
  DepartmentRosterSummary,
  ShortageReasonBreakdown,
  ScoringWeights,
  AssignmentExplanation,
  Department,
  Shift
} from '../types/roster';

export const DEFAULT_WEIGHTS: ScoringWeights = {
  skillMatch: 0.40,
  availability: 0.20,
  currentWorkingHours: 0.15,
  departmentExperience: 0.10,
  shiftBalance: 0.05,
  weeklyOffProtection: 0.05,
  overtimeRisk: 0.05,
};

/**
 * Step 1: Demand -> Calculate Staff Requirement using Ceiling Logic
 */
export function calculateStaffRequirement(demandValue: number, norm?: StaffingNorm): {
  rawCalculated: number;
  roundedRequirement: number;
  minStaff: number;
  maxStaff: number;
} {
  if (!norm || norm.ratio <= 0) {
    return { rawCalculated: 1, roundedRequirement: 1, minStaff: 1, maxStaff: 100 };
  }

  const raw = demandValue / norm.ratio;
  let required = Math.ceil(raw); // Ceiling logic as required

  // Apply min / max bounds
  if (required < norm.minStaff) required = norm.minStaff;
  if (norm.maxStaff && required > norm.maxStaff) required = norm.maxStaff;

  return {
    rawCalculated: Number(raw.toFixed(2)),
    roundedRequirement: required,
    minStaff: norm.minStaff,
    maxStaff: norm.maxStaff,
  };
}

export interface CandidateEvaluation {
  employee: Employee;
  isEligible: boolean;
  ineligibilityReason?: 'On Leave' | 'Weekly Off' | 'Shift Ineligible' | 'Max Hours Reached' | 'Skill Mismatch' | 'Already Assigned' | 'Inactive / Other';
  ineligibilityDetail?: string;
  explanation?: AssignmentExplanation;
  score: number;
}

/**
 * Step 2 & 3: Check Employee Eligibility and calculate transparent fairness score
 */
export function evaluateCandidate(
  employee: Employee,
  date: string,
  departmentId: string,
  shift: Shift,
  leaves: LeaveRecord[],
  existingRoster: RosterAssignment[],
  norm?: StaffingNorm,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): CandidateEvaluation {
  // 1. Active Check
  if (!employee.active) {
    return {
      employee,
      isEligible: false,
      ineligibilityReason: 'Inactive / Other',
      ineligibilityDetail: 'Employee profile is deactivated or on sabbatical',
      score: 0
    };
  }

  // 2. Department Check
  if (employee.departmentId !== departmentId) {
    return {
      employee,
      isEligible: false,
      ineligibilityReason: 'Inactive / Other',
      ineligibilityDetail: `Assigned to different department (${employee.departmentId})`,
      score: 0
    };
  }

  // 3. Shift Eligibility Check
  if (employee.eligibleShiftIds && !employee.eligibleShiftIds.includes(shift.id)) {
    return {
      employee,
      isEligible: false,
      ineligibilityReason: 'Shift Ineligible',
      ineligibilityDetail: `Not certified/eligible for shift "${shift.name}"`,
      score: 0
    };
  }

  // 4. Leave & Weekly Off Checks
  const activeLeave = leaves.find(
    (l) => l.employeeId === employee.id && (l.date === date || (l.endDate && date >= l.date && date <= l.endDate)) && l.status === 'Approved'
  );

  if (activeLeave) {
    if (activeLeave.type === 'Weekly Off') {
      return {
        employee,
        isEligible: false,
        ineligibilityReason: 'Weekly Off',
        ineligibilityDetail: `Scheduled weekly off (${activeLeave.reason || 'Standard rest day'})`,
        score: 0
      };
    } else {
      return {
        employee,
        isEligible: false,
        ineligibilityReason: 'On Leave',
        ineligibilityDetail: `${activeLeave.type}: ${activeLeave.reason || 'Approved leave'}`,
        score: 0
      };
    }
  }

  // 5. Check if already assigned to a shift on the same date
  const alreadyAssigned = existingRoster.find(
    (r) => r.employeeId === employee.id && r.date === date
  );
  if (alreadyAssigned) {
    return {
      employee,
      isEligible: false,
      ineligibilityReason: 'Already Assigned',
      ineligibilityDetail: `Already rostered to ${alreadyAssigned.shiftId} shift on ${date}`,
      score: 0
    };
  }

  // 6. Max Weekly Working Hours Check
  const currentWeeklyHours = employee.totalHoursAssignedThisWeek || 0;
  const shiftDuration = shift.durationHours || 8;
  const projectedHours = currentWeeklyHours + shiftDuration;

  if (currentWeeklyHours >= employee.maxWeeklyHours) {
    return {
      employee,
      isEligible: false,
      ineligibilityReason: 'Max Hours Reached',
      ineligibilityDetail: `Reached maximum limit of ${employee.maxWeeklyHours} hrs/week (Current: ${currentWeeklyHours} hrs)`,
      score: 0
    };
  }

  // 7. Skill / Competency Match
  let skillScore = 80; // Baseline good match
  let skillMatchPct = 80;
  let skillDetails = 'Standard departmental qualification';

  if (norm?.requiredSkillIds && norm.requiredSkillIds.length > 0) {
    let matchedSkillsCount = 0;
    let totalCompetency = 0;

    norm.requiredSkillIds.forEach((reqSkillId) => {
      const empSkill = employee.skills.find((s) => s.skillId === reqSkillId);
      if (empSkill) {
        matchedSkillsCount++;
        totalCompetency += empSkill.competencyLevel;
      }
    });

    if (matchedSkillsCount < norm.requiredSkillIds.length) {
      // Skill mismatch if missing mandatory core skill
      return {
        employee,
        isEligible: false,
        ineligibilityReason: 'Skill Mismatch',
        ineligibilityDetail: `Lacks required mandatory skill cert for this norm (${norm.requiredSkillIds.join(', ')})`,
        score: 0
      };
    }

    const avgCompetency = totalCompetency / norm.requiredSkillIds.length;
    // Scale 1-5 to percentage (1: 40%, 2: 55%, 3: 75%, 4: 90%, 5: 100%)
    skillMatchPct = Math.round((avgCompetency / 5) * 100);
    skillScore = skillMatchPct;
    skillDetails = `Competency Level: ${avgCompetency.toFixed(1)}/5.0 across required skills`;
  } else if (employee.skills && employee.skills.length > 0) {
    const avgLevel = employee.skills.reduce((acc, s) => acc + s.competencyLevel, 0) / employee.skills.length;
    skillMatchPct = Math.min(100, Math.round(60 + (avgLevel / 5) * 40));
    skillScore = skillMatchPct;
    skillDetails = `General Skill Index: ${avgLevel.toFixed(1)}/5.0 (${employee.skills.map((s) => s.skillName).slice(0, 2).join(', ')})`;
  }

  // 8. Availability & Readiness Score (0-100)
  const availabilityScore = 95; // Since passed leave check

  // 9. Current Working Hours Score (Fewer hours = Higher score for fairness)
  // E.g., if max is 48, working 0 hrs gets 100, 24 hrs gets 60, 44 hrs gets 15
  const hoursFraction = currentWeeklyHours / employee.maxWeeklyHours;
  const hoursScore = Math.max(10, Math.round(100 - hoursFraction * 85));

  // 10. Department Experience Score (Years capped at 10 years -> 100)
  const expScore = Math.min(100, 50 + (employee.experienceYears || 1) * 5);

  // 11. Shift Balance Score (Avoid overloading night shifts)
  let shiftBalanceScore = 90;
  if (shift.isNightShift) {
    const nightCount = employee.nightShiftsThisMonth || 0;
    shiftBalanceScore = Math.max(20, 100 - nightCount * 15);
  }

  // 12. Weekly Off Protection (Bonus if well-rested)
  const weeklyOffScore = 90;

  // 13. Overtime Risk Score
  let overtimeRisk: 'None' | 'Low' | 'Moderate' | 'High' = 'None';
  let overtimeScore = 95;
  if (projectedHours > employee.maxWeeklyHours) {
    overtimeRisk = 'High';
    overtimeScore = 20;
  } else if (projectedHours >= employee.maxWeeklyHours - 4) {
    overtimeRisk = 'Moderate';
    overtimeScore = 50;
  } else if (projectedHours >= employee.maxWeeklyHours - 8) {
    overtimeRisk = 'Low';
    overtimeScore = 75;
  }

  // Total Weighted Composite Score
  const totalScore = Number(
    (
      skillScore * weights.skillMatch +
      availabilityScore * weights.availability +
      hoursScore * weights.currentWorkingHours +
      expScore * weights.departmentExperience +
      shiftBalanceScore * weights.shiftBalance +
      weeklyOffScore * weights.weeklyOffProtection +
      overtimeScore * weights.overtimeRisk
    ).toFixed(2)
  );

  const explanation: AssignmentExplanation = {
    skillScore,
    skillMatchPercentage: skillMatchPct,
    skillDetails,
    availabilityStatus: 'Available',
    currentHoursBeforeAssignment: currentWeeklyHours,
    projectedHours,
    hoursScore,
    experienceScore: expScore,
    shiftBalanceScore,
    weeklyOffScore,
    overtimeRisk,
    totalScore,
    summaryReason: `Ranked #${totalScore} score | Skill match: ${skillMatchPct}% | Current load: ${currentWeeklyHours}h / ${employee.maxWeeklyHours}h | Overtime risk: ${overtimeRisk}`,
  };

  return {
    employee,
    isEligible: true,
    explanation,
    score: totalScore,
  };
}

/**
 * Step 4, 5, 6, 7: Dynamic Roster Generation Engine
 */
export function generateDynamicRosterForShift(
  date: string,
  department: Department,
  shift: Shift,
  allEmployees: Employee[],
  demandValue: number,
  norm: StaffingNorm | undefined,
  leaves: LeaveRecord[],
  existingRoster: RosterAssignment[],
  assignedBy: string = 'System Roster Engine',
  weights: ScoringWeights = DEFAULT_WEIGHTS
): {
  newAssignments: RosterAssignment[];
  summary: DepartmentRosterSummary;
  evaluations: CandidateEvaluation[];
} {
  // 1. Calculate Required Staff
  const { roundedRequirement } = calculateStaffRequirement(demandValue, norm);

  // 2. Department Employees Pool
  const deptEmployees = allEmployees.filter((e) => e.departmentId === department.id);

  // 3. Evaluate all departmental employees
  const evaluations: CandidateEvaluation[] = deptEmployees.map((emp) =>
    evaluateCandidate(emp, date, department.id, shift, leaves, existingRoster, norm, weights)
  );

  const eligibleCandidates = evaluations.filter((e) => e.isEligible);
  const ineligibleCandidates = evaluations.filter((e) => !e.isEligible);

  // 4. Sort Eligible Candidates by Composite Score (Descending)
  // Secondary Tie-breaker: Fewer current assigned hours, then higher experience
  eligibleCandidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const hoursA = a.employee.totalHoursAssignedThisWeek || 0;
    const hoursB = b.employee.totalHoursAssignedThisWeek || 0;
    if (hoursA !== hoursB) return hoursA - hoursB; // Fewer hours prioritized
    return (b.employee.experienceYears || 0) - (a.employee.experienceYears || 0);
  });

  // 5. Allocate up to Required Staff
  const selectedCandidates = eligibleCandidates.slice(0, roundedRequirement);

  const newAssignments: RosterAssignment[] = selectedCandidates.map((cand) => {
    const shiftDuration = shift.durationHours || 8;
    const currentHours = cand.employee.totalHoursAssignedThisWeek || 0;
    const isOvertime = currentHours + shiftDuration > cand.employee.maxWeeklyHours;
    const overtimeHours = isOvertime ? currentHours + shiftDuration - cand.employee.maxWeeklyHours : 0;

    return {
      id: `ROST-${date}-${department.id}-${shift.id}-${cand.employee.id}`,
      date,
      departmentId: department.id,
      shiftId: shift.id,
      employeeId: cand.employee.id,
      employeeName: cand.employee.name,
      designation: cand.employee.designation,
      status: 'Confirmed',
      assignedBy,
      assignedAt: new Date().toISOString(),
      explanation: cand.explanation!,
      overtimeHours,
      notes: isOvertime ? `Includes ${overtimeHours} hrs overtime over weekly threshold` : undefined,
    };
  });

  // 6. Calculate Shortage & Surplus
  const allocatedCount = newAssignments.length;
  const shortage = Math.max(0, roundedRequirement - allocatedCount);
  const surplus = Math.max(0, eligibleCandidates.length - roundedRequirement);

  // 7. Group Ineligibility Breakdown
  const reasonMap: Record<string, { id: string; name: string; detail: string }[]> = {
    'On Leave': [],
    'Weekly Off': [],
    'Shift Ineligible': [],
    'Max Hours Reached': [],
    'Skill Mismatch': [],
    'Already Assigned': [],
    'Inactive / Other': [],
  };

  ineligibleCandidates.forEach((c) => {
    const reasonKey = c.ineligibilityReason || 'Inactive / Other';
    if (reasonMap[reasonKey]) {
      reasonMap[reasonKey].push({
        id: c.employee.id,
        name: c.employee.name,
        detail: c.ineligibilityDetail || '',
      });
    }
  });

  const shortageReasons: ShortageReasonBreakdown[] = Object.entries(reasonMap)
    .filter(([_, list]) => list.length > 0)
    .map(([reason, list]) => ({
      reason: reason as ShortageReasonBreakdown['reason'],
      count: list.length,
      affectedEmployees: list,
    }));

  // 8. Generate Practical Hospital Mitigation Suggestions
  const mitigationSuggestions: string[] = [];
  if (shortage > 0) {
    if (reasonMap['On Leave'].length > 0) {
      mitigationSuggestions.push(`Review non-critical leave approvals or recall standby staff.`);
    }
    if (reasonMap['Shift Ineligible'].length > 0) {
      mitigationSuggestions.push(`Consider rapid shift cross-authorization for ${reasonMap['Shift Ineligible'].length} experienced staff.`);
    }
    if (reasonMap['Max Hours Reached'].length > 0) {
      mitigationSuggestions.push(`Approve targeted 4-hour overtime extension for eligible nurses with low fatigue index.`);
    }
    mitigationSuggestions.push(`Request float pool allocation from adjacent non-critical wards or OPD.`);
  }

  let status: DepartmentRosterSummary['status'] = 'Adequate';
  if (shortage >= 3) {
    status = 'Critical';
  } else if (shortage > 0) {
    status = 'Shortage';
  } else if (surplus > 0 || eligibleCandidates.length > roundedRequirement) {
    status = 'Surplus';
  } else if (eligibleCandidates.length === roundedRequirement) {
    status = 'Adequate';
  }

  const summary: DepartmentRosterSummary = {
    date,
    departmentId: department.id,
    shiftId: shift.id,
    demandValue,
    demandMetric: norm?.demandMetric || 'Default Units',
    normRatio: norm?.ratio || 1,
    requiredStaff: roundedRequirement,
    availableStaff: deptEmployees.length - reasonMap['On Leave'].length - reasonMap['Weekly Off'].length,
    eligibleStaff: eligibleCandidates.length,
    allocatedStaff: allocatedCount,
    shortage,
    surplus,
    status,
    shortageReasons,
    mitigationSuggestions,
  };

  return {
    newAssignments,
    summary,
    evaluations,
  };
}
