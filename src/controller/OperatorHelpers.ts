import {Section} from "./DatasetController";

export default class OperatorHelpers {
    public static GreaterThan(section: any, field: string, value: number) {
        return section[field] > Number(value);
    }

    public static LessThan(section: any, field: string, value: number) {
        return section[field] < Number(value);
    }

    public static EqualTo(section: any, field: string, value: number) {
        return section[field] == Number(value);
    }

    public static NotEqualTo(section: any, field: string, value: number) {
        return section[field] != Number(value);
    }

    public static StringIsEqualTo(section: any, field: string, value: string) {
        return OperatorHelpers.compareStringsWithWildcards(section[field], value, false);
    }

    public static StringIsNotEqualTo(section: any, field: string, value: string) {
        return OperatorHelpers.compareStringsWithWildcards(section[field], value, true);
    }

    public static deptCompare(a: Section, b: Section){
        return a.dept.localeCompare(b.dept);
    }

    public static idCompare(a: Section,b:Section){
        return a.dept.localeCompare(b.dept);
    }

    public static avgCompare(a: Section, b:Section){
        return a.avg - b.avg;
    }

    public static instructorCompare(a: Section, b:Section){
        return a.professor.localeCompare(b.professor);
    }

    public static titleCompare(a: Section, b:Section){
        return a.title.localeCompare(b.title);
    }

    public static passCompare(a:Section, b:Section){
        return a.pass - b.pass;
    }

    public static failCompare(a:Section, b:Section){
        return a.fail - b.fail;
    }

    public static auditCompare(a:Section, b:Section){
        return a.audit - b.audit;
    }

    private static compareStringsWithWildcards(s1: string, s2: string, negated: boolean): boolean {
        if (s2.includes("*")) {
            let s2Parts: string[] = s2.split("*");
            let is1: number = 0;
            if (s2[0] !== "*") {
                is1 = s1.indexOf(s2Parts[0]);
                if (is1 !== 0) {
                    return negated;
                }
            }
            for (let i = 0; i < s2Parts.length; i++) {
                is1 = s1.indexOf(s2Parts[i], is1);
                if (is1 === -1) {
                    return negated;
                }
                is1 += s2Parts[i].length;
            }
            if (s2[s2.length - 1] !== "*") {
                if (s1.length != is1) {
                    return negated;
                }
            }
            return !negated;
        } else {
            if (s1.length != s2.length) {
                return negated;
            }
            for (let i = 0; i < s1.length; i++) {
                if (s1[i] !== s2[i]) {
                    return negated;
                }
            }
            return !negated;
        }
    }

    public static compare_arrays(a: any[], b: any[]): number {
        return a.length - b.length;
    }
}