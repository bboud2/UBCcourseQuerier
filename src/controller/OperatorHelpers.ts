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
        return section[field] === value;
    }

    public static StringIsNotEqualTo(section: any, field: string, value: string) {
        return section[field] !== value;
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
}