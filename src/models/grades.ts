export type Grade = typeof listOfGrades[number];
export type GradePercentage = typeof listOfPercents[number];
export type GradePercentageCutoff = typeof listOfPercentCutoffs[number];

export const gradeToPercentCutoff = {
  "A+": 85,
  A: 75,
  "B+": 65,
  B: 55,
  "C+": 45,
  C: 35,
  "D+": 25,
  D: 15,
  F: 0,
  INC: -2
} as const;

export const gradeToPercentUpperCutoff = {
  "A+": Infinity,
  A: 85,
  "B+": 75,
  B: 65,
  "C+": 55,
  C: 45,
  "D+": 35,
  D: 25,
  F: 15,
  INC: -2
} as const;

export const gradeToPercent = {
  "A+": 90,
  A: 80,
  "B+": 70,
  B: 60,
  "C+": 50,
  C: 40,
  "D+": 30,
  D: 20,
  F: 10,
  INC: -2
} as const;


export const listOfGrades = [
  "A+",
  "A",
  "B+",
  "B",
  "C+",
  "C",
  "D+",
  "D",
  "F",
  "INC"
] as const;

export const listOfPercents = [
  90,
  80,
  70,
  60,
  50,
  40,
  30,
  20,
  10,
  -2
] as const;
export const listOfPercentCutoffs = [
  85,
  75,
  65,
  55,
  45,
  35,
  25,
  15,
  0,
  -2
] as const;

export const convertPercentCutoffToGrade = (percent: number): typeof listOfGrades[number] => {
  for (let obj in gradeToPercentCutoff) {
    if (percent >= gradeToPercentCutoff[obj as keyof typeof gradeToPercentCutoff]) {
      return obj as keyof typeof gradeToPercentCutoff;
    }
  }
  return "F";
}

export const convertLPercentToGrade = (percent: number): typeof listOfGrades[number] => {
  for (let obj of Object.keys(gradeToPercent).toReversed()) {
    if (obj == "INC") continue;
    if (percent <= gradeToPercent[obj as keyof typeof gradeToPercent]) {
      return obj as keyof typeof gradeToPercent;
    }
  }
  return "F";
}
export const convertGPercentToGrade = (percent: number): typeof listOfGrades[number] => {
  for (let obj in gradeToPercent) {
    if (percent > gradeToPercent[obj as keyof typeof gradeToPercent]) {
      return obj as keyof typeof gradeToPercent;
    }
  }
  return "F";
}

export enum SpecialGrade {
  INC = -2,
  INVALID = -1,
  TOO_LOW = -3,
  TOO_HIGH = -4
}

export class GradeManager {
  public categories: Category[];
  public assignments: Assignment[];
  public totalWeight: number;

  public constructor(categories: Category[], assignments: Assignment[], totalWeight: number) {
    this.categories = categories;
    this.assignments = assignments;
    this.totalWeight = totalWeight;
  }

  public getAssignmentsByCategory(category: Category): Assignment[] {
    return this.assignments.filter((assignment) => assignment.category === category);
  }

  public getAssignmentsByCategoryEntries(category: Category): [Assignment, number][] {
    return (this.assignments.map((a, i) => [a, i]) as [Assignment, number][]).filter((assignmentEntry) => assignmentEntry[0].category === category);
  }


  public getCategoryByName(name: string): Category | null {
    for (let category of this.categories) {
      if (category.name === name) {
        return category;
      }
    }
    return null;
  }

  public getCategoryById(id: number): Category | null {
    for (let category of this.categories) {
      if (category.id === id) {
        return category;
      }
    }
    return null;
  }
  public getSeeAssignment(): Assignment | null {
    for (let assignment of this.assignments) {
      if (assignment.see) {
        return assignment;
      }
    }
    return null;
  }

  public getAssignmentById(id: number): Assignment | null {
    for (let assignment of this.assignments) {
      if (assignment.id === id) {
        return assignment;
      }
    }
    return null;
  }

  public validWeights(): boolean {
    let curTotalWeight = 0;
    for (let category of this.categories) {
      curTotalWeight += category.weight;
    }

    if (curTotalWeight !== this.totalWeight) {
      return false;
    }

    return true;
  }

  public sumOfWeightsInCategory(category: Category): number {
    let categoryAssignments = this.getAssignmentsByCategory(category);
    let categoryAssignmentWeight = 0;
    for (let assignment of categoryAssignments) {
      if (assignment.see) continue;
      categoryAssignmentWeight += assignment.weight;
    }
    return categoryAssignmentWeight;
  }

  public calculateGradePercentage(): number | SpecialGrade.INC | SpecialGrade.INVALID {
    if (!this.validWeights()) return SpecialGrade.INVALID;
    let totalGrade = 0;
    for (let category of this.categories) {
      if (this.getSeeAssignment()?.category.id == category.id) continue;
      let categoryGrade = 0;
      let categoryAssignments = this.getAssignmentsByCategory(category);
      let categorySumOfWeights = this.sumOfWeightsInCategory(category);
      for (let assignment of categoryAssignments) {
        if (assignment.see) continue;
        if (assignment.grade == "INC") return SpecialGrade.INC;
        categoryGrade += gradeToPercent[assignment.grade] * (assignment.weight / 100);
      }
      if (categoryGrade != 0 && this.calcedTotalWeight != 0) totalGrade += (categoryGrade / categorySumOfWeights) * 100 * (category.weight / this.calcedTotalWeight);
    }
    return totalGrade;
  }

  get calcedTotalWeight(): number {
    let seeAssignment = this.getSeeAssignment();
    if (seeAssignment) return this.totalWeight - seeAssignment.category.weight;
    return this.totalWeight;
  }

  public calculateCategoryGradePercentage(categoryId: number): number | SpecialGrade.INC | SpecialGrade.INVALID {
    let category = this.getCategoryById(categoryId);
    if (category === null) return SpecialGrade.INVALID;
    let categoryGrade = 0;
    let categoryAssignments = this.getAssignmentsByCategory(category);
    let categorySumOfWeights = this.sumOfWeightsInCategory(category);
    for (let assignment of categoryAssignments) {
      if (assignment.see) continue;
      if (assignment.grade == "INC") return SpecialGrade.INC;
      categoryGrade += gradeToPercent[assignment.grade] * assignment.weight;
    }
    if (categorySumOfWeights != 0) return categoryGrade / categorySumOfWeights;
    return 0;
  }

  public addAssignment(assignment: Assignment): void {
    this.assignments.push(assignment);
  }

  public removeAssignment(assignment: Assignment): void {
    this.assignments = this.assignments.filter((a) => a !== assignment);
  }

  public addCategory(category: Category): void {
    this.categories.push(category);
  }

  public removeCategory(category: Category): void {
    this.categories = this.categories.filter((c) => c !== category);
  }

}
export class Category {
  public name: string;
  public weight: number;
  public id: number;
  public static nextId = 0;

  public constructor(name: string, weight: number) {
    this.name = name;
    this.weight = weight;
    this.id = Category.nextId++;
  }
}
export class Assignment {
  public name: string;
  private _grade: Grade;
  private _percent: GradePercentage;
  public category: Category;
  public weight: number
  public id: number;
  public see: boolean = false;
  public static nextId = 0;

  public constructor(name: string, grade: Grade, category: Category, weight: number) {
    this.name = name;
    this._grade = grade;
    this._percent = gradeToPercent[grade];
    this.category = category;
    this.weight = weight;
    this.id = Category.nextId++;
  }

  set grade(grade: Grade) {
    this._grade = grade;
    this._percent = gradeToPercent[grade];
  }

  get grade(): Grade {
    return this._grade;
  }

  set percent(percent: GradePercentage) {
    this._percent = percent;
    this._grade = convertPercentCutoffToGrade(percent);
  }

  get percent(): GradePercentage {
    return this._percent;
  }
}