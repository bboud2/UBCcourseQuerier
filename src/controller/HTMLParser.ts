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

        console.log("We are in parseRooms");
        let document: ASTNode = parse5.parse(html);
        let returnRooms: Room[] = [];

        let roomTableInfoBody: ASTNode = HTMLParser.getHTMLNode(document, "table", "views-table cols-5 table").childNodes[1];

        roomTableInfoBody.childNodes.forEach(function(child: ASTNode) {
            returnRooms.push(this.parseRoom(child,short_name));
        });


        return returnRooms;
    }
    private parseRoom(node: ASTNode, short_name: string): Room{

        let returnRoom : Room = {
            id_key: this.next_id.toString(),
            full_name: null,
            short_name: short_name,
            number: null,
            name: null,
            address: null,
            lat: null,
            lon: null,
            seats: null,
            type: null,
            furniture: null,
            href: null
        };


        node.childNodes.forEach(function (child) {

            let header: string = child.attrs[0].value.toString(); //get the value in the class field of each field

            switch (header) {
                case("views-field views-field-field-room-number"):
                    returnRoom.number = child.childNodes[0].childNodes[0].toString();
                    break;
                case("views-field views-field-field-room-capacity"):
                    returnRoom.seats = Number(child.childNodes[0]);
                    break;
                case("views-field views-field-field-room-furniture"):
                    returnRoom.furniture = child.childNodes[0].toString();
                    break;
                case("views-field views-field-field-room-type"):
                    returnRoom.type = child.childNodes[0].toString();
                    break;
                case("views-field views-field-nothing"):
                    returnRoom.href = child.childNodes[0].attrs[0].value.toString(); //TODO convert this to appropriate URL format
                    break;
            }
        });
        console.log(returnRoom.number.toString());
        return returnRoom;
    }
//stored under <table class="views-table cols-5 table" >

    private static getHTMLNode(node: ASTNode, nodeName: string, classText: string): ASTNode {
        if (node.nodeName == nodeName) {
            if (classText == null) {
                return node;
            } else {
                if (node.hasOwnProperty("attrs")) {
                    node.attrs.forEach(function(attr: ASTAttribute) {
                        if (attr.name == "class" && attr.value == classText) {
                            return node;
                        }
                    });
                }
            }
        } else {
            if (node.hasOwnProperty("childNodes")) {
                let results: ASTNode[] = [];
                node.childNodes.forEach(function(child: ASTNode) {
                    results.push(HTMLParser.getHTMLNode(child, nodeName, classText));
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


}

