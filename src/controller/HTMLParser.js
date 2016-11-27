"use strict";
var parse5 = require('parse5');
var LatLonGetter_1 = require("./LatLonGetter");
var HTMLParser = (function () {
    function HTMLParser() {
        this.next_id = 0;
    }
    HTMLParser.prototype.parseRooms = function (html, short_name) {
        var that = this;
        return new Promise(function (fulfill, reject) {
            var document = parse5.parse(html);
            var returnRooms = [];
            var addressNode = HTMLParser.getHTMLNode(document, "div", "class", "field-content");
            var address = addressNode.childNodes[0].value.trim();
            var fullNameNode = HTMLParser.getHTMLNode(document, "span", "class", "field-content");
            var fullName = fullNameNode.childNodes[0].value.trim();
            var roomTableInfoBody = HTMLParser.getHTMLNode(document, "tbody", null, null);
            if (roomTableInfoBody == null) {
                fulfill([]);
            }
            roomTableInfoBody.childNodes.forEach(function (child) {
                if (child.nodeName == "tr") {
                    returnRooms.push(that.parseRoom(child, short_name, fullName, address));
                }
            });
            var modAddress = encodeURI(address);
            LatLonGetter_1.default.getLatLon(modAddress, returnRooms).then(function () {
                fulfill(returnRooms);
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    HTMLParser.prototype.parseRoom = function (node, short_name, fullName, address) {
        var returnRoom = {
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
        node.childNodes.forEach(function (child) {
            if (child.hasOwnProperty("attrs")) {
                var header = null;
                for (var i = 0; i < child.attrs.length; i++) {
                    if (child.attrs[i].name.trim() == "class") {
                        header = child.attrs[i].value;
                    }
                }
                if (header == null) {
                    throw ("no class attribute on ASTNode");
                }
                switch (header) {
                    case ("views-field views-field-field-room-number"):
                        child.childNodes.forEach(function (targetChild) {
                            if (targetChild.nodeName == "a") {
                                returnRoom.number = targetChild.childNodes[0].value;
                            }
                        });
                        break;
                    case ("views-field views-field-field-room-capacity"):
                        returnRoom.seats = Number(child.childNodes[0].value.trim());
                        break;
                    case ("views-field views-field-field-room-furniture"):
                        returnRoom.furniture = child.childNodes[0].value.trim();
                        break;
                    case ("views-field views-field-field-room-type"):
                        returnRoom.type = child.childNodes[0].value.trim();
                        break;
                    case ("views-field views-field-nothing"):
                        child.childNodes.forEach(function (targetChild) {
                            if (targetChild.nodeName == "a") {
                                returnRoom.href = targetChild.attrs[0].value;
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
    };
    HTMLParser.getHTMLNode = function (node, nodeName, attrName, attrText) {
        var results = [];
        if (node.nodeName.trim() == nodeName) {
            if (attrName == null) {
                return node;
            }
            else {
                var isNode_1 = false;
                if (node.hasOwnProperty("attrs")) {
                    node.attrs.forEach(function (attr) {
                        if (attr.name.trim() == attrName && attr.value.trim() == attrText) {
                            isNode_1 = true;
                        }
                    });
                }
                if (isNode_1) {
                    return node;
                }
            }
        }
        if (node.hasOwnProperty("childNodes")) {
            node.childNodes.forEach(function (child) {
                results.push(HTMLParser.getHTMLNode(child, nodeName, attrName, attrText));
            });
        }
        for (var i = 0; i < results.length; i++) {
            if (results[i] != null) {
                return results[i];
            }
        }
        return null;
    };
    HTMLParser.getBuildingFromRow = function (row) {
        var output = null;
        if (row.hasOwnProperty("childNodes")) {
            row.childNodes.forEach(function (cell) {
                if (cell.hasOwnProperty("attrs")) {
                    cell.attrs.forEach(function (attr) {
                        if (attr.name == "class" && attr.value == "views-field views-field-field-building-code") {
                            output = cell.childNodes[0].value.toString().trim();
                        }
                    });
                }
            });
        }
        return output;
    };
    HTMLParser.parseIndex = function (indexFile) {
        return new Promise(function (fulfill, reject) {
            var indexNode = parse5.parse(indexFile);
            var tableNode = HTMLParser.getHTMLNode(indexNode, "tbody", null, null);
            if (tableNode == null || !tableNode.childNodes) {
                reject("tbody not found in indexFile or tbody is empty");
            }
            var buildings = [];
            tableNode.childNodes.forEach(function (child) {
                var building = HTMLParser.getBuildingFromRow(child);
                if (building != null) {
                    buildings.push(building);
                }
            });
            fulfill(buildings);
        });
    };
    return HTMLParser;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HTMLParser;
//# sourceMappingURL=HTMLParser.js.map