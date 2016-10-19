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

    public static dynamicSort(field: string, ascending: boolean): any {
        let reverse: number = (ascending) ? 1: -1;
        return function (a: any, b: any) {
            if (a[field] < b[field]) {
                return -1 * reverse;
            } else if (a[field] == b[field]) {
                return 0;
            } else {
                return reverse;
            }
        }
    }
    
    // TODO: change this method to not work on wildcard characters in the middle of the string.
    private static compareStringsWithWildcards(s1: string, s2: string, negated: boolean): boolean {
        if (s2.includes("*")) {
            let s2Parts: string[] = s2.split("*");
            let is1: number = 0;
            if (s2[0] !== "*") {                //check that first chunk is not embedded
                is1 = s1.indexOf(s2Parts[0]);
                if (is1 !== 0) {
                    return negated;             //if chunk is not at the first location, return false
                }
            }
            for (let i = 0; i < s2Parts.length; i++) {
                is1 = s1.indexOf(s2Parts[i], is1);  //find [ith] chunk location
                if (is1 === -1) {
                    return negated;
                }
                is1 += s2Parts[i].length;  //shift location over to end of chunk
            }
            if (s2[s2.length - 1] !== "*") {  //check if extra characters are allowed on the end
                if (s1.length != is1) {
                    return negated;
                }
            }
            return !negated;
        } else {   //no wild card case
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

    private static isFieldNumeric(field: string) {
        return (field === "avg" || field === "fail" || field === "pass" || field === "audit");
    }

    public static handle_max(sections: Section[], field: string) {
        if (!OperatorHelpers.isFieldNumeric(field)) {
            throw  {ID: 400, MESSAGE: "Expected a numeric field for handle_max but got " + field};
        }
        let max_val =  Number.MIN_SAFE_INTEGER;
        for (let s = 0; s < sections.length; s++) {
            let curr_section: any = sections[s];
            if (curr_section[field] > max_val) {
                max_val = curr_section[field];
            }
        }
        return max_val;
    }

    public static handle_min(sections: Section[], field: string) {
        if (!OperatorHelpers.isFieldNumeric(field)) {
            throw  {ID: 400, MESSAGE: "Expected a numeric field for handle_min but got " + field};
        }
        let min_val =  Number.MAX_SAFE_INTEGER;
        for (let s = 0; s < sections.length; s++) {
            let curr_section: any = sections[s];
            if (curr_section[field] < min_val) {
                min_val = curr_section[field];
            }
        }
        return min_val;
    }

    public static handle_avg(sections: Section[], field: string) {
        if (!OperatorHelpers.isFieldNumeric(field)) {
            throw  {ID: 400, MESSAGE: "Expected a numeric field for handle_avg but got " + field};
        }
        let tally: number = 0;
        for (let s = 0; s < sections.length; s++) {
            let curr_section: any = sections[s];
            tally += curr_section[field];
        }
        return Number((tally / sections.length).toFixed(2));
    }

    public static handle_count(sections: Section[], field: string) {
        let unique_finds: any[] = [];
        for (let s = 0; s < sections.length; s++) {
            let curr_section: any = sections[s];
            if (unique_finds.indexOf(curr_section[field]) == -1) {
                unique_finds.push(curr_section[field]);
            }
        }
        return unique_finds.length;
    }

}