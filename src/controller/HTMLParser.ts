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
import HTML = Mocha.reporters.HTML;
import latLonGetter from "./LatLonGetter"


export default class HTMLParser {
    private next_id: number;

    constructor() {
        this.next_id = 0;
    }

    public parseRooms(html: string, short_name: string): Promise<Room[]> {
        let that = this;
        return new Promise(function(fulfill, reject) {
            let document: ASTNode = parse5.parse(html);
            let returnRooms: Room[] = [];

            let addressNode: ASTNode = HTMLParser.getHTMLNode(document, "div", "class","field-content" );
            //console.log(addressNode);
            let address:string = addressNode.childNodes[0].value.trim();

            let fullNameNode: ASTNode = HTMLParser.getHTMLNode(document, "span", "class", "field-content");
            //console.log(addressBody);
            let fullName: string = fullNameNode.childNodes[0].value.trim();

            let roomTableInfoBody: ASTNode = HTMLParser.getHTMLNode(document, "tbody", null, null);
            if (roomTableInfoBody == null) {
                fulfill([]);
            }
            roomTableInfoBody.childNodes.forEach(function(child: ASTNode) {
                if(child.nodeName == "tr") {
                    returnRooms.push(that.parseRoom(child, short_name, fullName, address));
                }
            });

            let modAddress: string = encodeURI(address);
            latLonGetter.getLatLon(modAddress, returnRooms).then(function () {
                fulfill(returnRooms);
            }).catch(function (error: string) {
                reject(error);
            });
        });
    }

    private parseRoom(node: ASTNode, short_name: string, fullName:string, address:string): Room{
        let returnRoom : Room = {
            id_key: this.next_id.toString(),
            full_name: fullName,
            short_name: short_name,
            number: null,
            name: "",
            address: address,
            lat: null,
            lon: null,
            seats: null,
            type: null,
            furniture: null,
            href: null,
            distance: null
        };

        //console.log(node);
        node.childNodes.forEach(function (child: ASTNode) {
            if(child.hasOwnProperty("attrs")) {
                let header: string = null;
                for(let i = 0; i < child.attrs.length; i++) {
                    if (child.attrs[i].name.trim() == "class") {
                        header = child.attrs[i].value; //get the value in the class field of each row
                    }
                }
                if (header == null) {
                    throw("no class attribute on ASTNode");
                }
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

        returnRoom.name = returnRoom.name.concat(returnRoom.short_name);
        returnRoom.name = returnRoom.name.concat("_");
        returnRoom.name = returnRoom.name.concat(returnRoom.number);
        this.next_id++;
        return returnRoom;
    }


    private static getHTMLNode(node: ASTNode, nodeName: string, attrName: string, attrText: string): ASTNode {
        var results: ASTNode[] = [];
        if (node.nodeName.trim() == nodeName) {
            if (attrName == null) {
                return node;
            } else {
                let isNode: boolean = false;
                if (node.hasOwnProperty("attrs")) {
                    node.attrs.forEach(function(attr: ASTAttribute) {
                        if (attr.name.trim() == attrName && attr.value.trim() == attrText) {
                            isNode = true;
                        }
                    });
                }
                if (isNode) {
                    return node;
                }
            }
        }
        if (node.hasOwnProperty("childNodes")) {
            node.childNodes.forEach(function(child: ASTNode) {
                results.push(HTMLParser.getHTMLNode(child, nodeName, attrName, attrText));
            });
        }
        for (let i = 0; i < results.length; i++) {
            if (results[i] != null) {
                return results[i];
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
            let tableNode: ASTNode = HTMLParser.getHTMLNode(indexNode, "tbody", null, null);
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

