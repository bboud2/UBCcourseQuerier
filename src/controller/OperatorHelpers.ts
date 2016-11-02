export default class OperatorHelpers {
    public static GreaterThan(object: any, field: string, value: number) {
        return object[field] > Number(value);
    }

    public static LessThan(object: any, field: string, value: number) {
        return object[field] < Number(value);
    }

    public static EqualTo(object: any, field: string, value: number) {
        return object[field] == Number(value);
    }

    public static NotEqualTo(object: any, field: string, value: number) {
        return object[field] != Number(value);
    }

    public static StringIsEqualTo(object: any, field: string, value: string) {
        return OperatorHelpers.compareStringsWithWildcards(object[field], value, false);
    }

    public static StringIsNotEqualTo(object: any, field: string, value: string) {
        return OperatorHelpers.compareStringsWithWildcards(object[field], value, true);
    }

    public static dynamicSort(fields: string[], ascending: boolean): any {
        let reverse: number = (ascending) ? 1: -1;
        return function (a: any, b: any) {
            for (let f = 0; f < fields.length; f++) {
                if (a[fields[f]] < b[fields[f]]) {
                    return -1 * reverse;
                } else if (a[fields[f]] > b[fields[f]]) {
                    return reverse;
                }
            }
            return 0;
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
        return (field === "avg" || field === "fail" || field === "pass" || field === "audit"
        || field === "lat" || field === "lon" || field === "seats");
    }

    public static handle_max(objects: any[], field: string) {
        if (!OperatorHelpers.isFieldNumeric(field)) {
            throw  {ID: 400, MESSAGE: "Expected a numeric field for handle_max but got " + field};
        }
        let max_val =  Number.MIN_SAFE_INTEGER;
        for (let s = 0; s < objects.length; s++) {
            let curr_object: any = objects[s];
            if (curr_object[field] > max_val) {
                max_val = curr_object[field];
            }
        }
        return max_val;
    }

    public static handle_min(objects: any[], field: string) {
        if (!OperatorHelpers.isFieldNumeric(field)) {
            throw  {ID: 400, MESSAGE: "Expected a numeric field for handle_min but got " + field};
        }
        let min_val =  Number.MAX_SAFE_INTEGER;
        for (let s = 0; s < objects.length; s++) {
            let curr_object: any = objects[s];
            if (curr_object[field] < min_val) {
                min_val = curr_object[field];
            }
        }
        return min_val;
    }

    public static handle_avg(objects: any[], field: string) {
        if (!OperatorHelpers.isFieldNumeric(field)) {
            throw  {ID: 400, MESSAGE: "Expected a numeric field for handle_avg but got " + field};
        }
        let tally: number = 0.0;
        for (let s = 0; s < objects.length; s++) {
            let curr_object: any = objects[s];
            tally += curr_object[field];
        }
        return Number((tally / objects.length).toFixed(2));
    }

    public static handle_count(objects: any[], field: string) {
        let unique_finds: any[] = [];
        for (let s = 0; s < objects.length; s++) {
            let curr_object: any = objects[s];
            if (unique_finds.indexOf(curr_object[field]) == -1) {
                unique_finds.push(curr_object[field]);
            }
        }
        return unique_finds.length;
    }

}