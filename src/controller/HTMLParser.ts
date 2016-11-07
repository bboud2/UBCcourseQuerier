/**
 * Created by Ben on 11/2/2016.
 */
/**
 * Created by Ben on 11/1/2016.
 */

import {Room} from "./DatasetController";
import parse5 = require('parse5');
import {ASTNode} from "parse5";
import {ASTAttribute} from "parse5";
import Log from "../Util";


export default class HTMLParser {

    private next_id: number;

    constructor() {
        this.next_id = 0;
    }

    public parseRooms(html: string, short_name: string): Room[] {

        let document: ASTNode = parse5.parse(html);
        let returnRooms: Room[] = [];

        let addressBody:ASTNode = HTMLParser.getHTMLNode(document, "div" , "skip");
        console.log(addressBody);

        let roomTableInfoBody: ASTNode = HTMLParser.getHTMLNode(document, "tbody", null);
        let that = this;
        //console.log(roomTableInfoBody);
        //console.log(roomTableInfoBody.childNodes[0]);
        roomTableInfoBody.childNodes.forEach(function(child: ASTNode) {
            //console.log(child.nodeName);
            if(child.nodeName == "tr") {
                returnRooms.push(that.parseRoom(child, short_name));
            }
        });

        return returnRooms;
    }
    private parseRoom(node: ASTNode, short_name: string): Room{

        let returnRoom : Room = {
            id_key: this.next_id.toString(),
            full_name: null,
            short_name: short_name,
            number: null,
            name: "",
            address: null,
            lat: null,
            lon: null,
            seats: null,
            type: null,
            furniture: null,
            href: null
        };

        //console.log(node);
        node.childNodes.forEach(function (child: ASTNode) {

            if(child.hasOwnProperty("attrs")) {
                let header: string = child.attrs[0].value; //get the value in the class field of each field

                //console.log(header);

                switch (header) {
                    case("views-field views-field-field-room-number"):
                        //console.log("got into the right switch statement");
                        child.childNodes.forEach(function(targetChild: ASTNode){
                            if(targetChild.nodeName == "a") {
                                returnRoom.number = targetChild.childNodes[0].value;
                            }
                        });
                        break;
                    case("views-field views-field-field-room-capacity"):
                        returnRoom.seats = Number(child.childNodes[0].value.trim());
                        break;
                    case("views-field views-field-field-room-furniture"):
                        //console.log(child.childNodes[0].value.trim());
                        returnRoom.furniture = child.childNodes[0].value.trim();
                        //console.log(returnRoom);
                        break;
                    case("views-field views-field-field-room-type"):
                        //console.log(child.childNodes[0].value.trim());
                        returnRoom.type = child.childNodes[0].value.trim();
                        //console.log(returnRoom);
                        break;
                    case("views-field views-field-nothing"):
                        //console.log(child);
                        child.childNodes.forEach(function(targetChild: ASTNode){
                           if(targetChild.nodeName == "a"){
                               //console.log(targetChild);
                               returnRoom.href = targetChild.attrs[0].value;
                               //console.log(returnRoom);
                           }
                        });
                        break;
                    default:
                        console.log("BAD!");
                }
            }
        });

        returnRoom.name.concat(returnRoom.short_name); // FIX THIS
        this.next_id++;
        return returnRoom;
    }
//stored under <table class="views-table cols-5 table" >

    private static getHTMLNode(node: ASTNode, nodeName: string, idText: string): ASTNode {
        if (node.nodeName == nodeName) {
            if (idText == null) {
                return node;
            } else {
                if (node.hasOwnProperty("attrs")) {
                    node.attrs.forEach(function(attr: ASTAttribute) {
                        if (attr.name == "class" && attr.value.trim() == idText) {
                            return node;
                        }
                    });
                }
            }
        } else {
            if (node.hasOwnProperty("childNodes")) {
                let results: ASTNode[] = [];
                node.childNodes.forEach(function(child: ASTNode) {
                    results.push(HTMLParser.getHTMLNode(child, nodeName, idText));
                });
                for (let i = 0; i < results.length; i++) {
                    if (results[i] != null) {
                        return results[i];
                    }
                }
            }
        }
        return null;
    }

    private static getBuildingFromRow(row: ASTNode): string {
        let output: string = null;
        if (row.hasOwnProperty("childNodes")) {
            row.childNodes.forEach(function(cell: ASTNode) {
                if (cell.hasOwnProperty("attrs")) {
                    cell.attrs.forEach(function(attr: ASTAttribute) {
                        if (attr.name == "class" && attr.value == "views-field views-field-field-building-code") {
                            output = cell.childNodes[0].value.toString().trim();
                        }
                    });
                }
            });
        }
        return output;
    }

    public static parseIndex(indexFile: string): Promise<string[]> {
        return new Promise(function (fulfill, reject) {
            let indexNode: ASTNode = parse5.parse(indexFile);
            let tableNode: ASTNode = HTMLParser.getHTMLNode(indexNode, "tbody", null);
            if (tableNode == null || !tableNode.childNodes) {
                reject("tbody not found in indexFile or tbody is empty");
            }
            let buildings: string[] = [];
            tableNode.childNodes.forEach(function(child: ASTNode) {
                let building: string = HTMLParser.getBuildingFromRow(child);
                if (building != null) {
                    buildings.push(building);
                }
            });
            fulfill(buildings);
        })
    }
}

