"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Media = void 0;
// This is a function that return function
var isAdminOrHasAccessToImages = function () {
    return function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var user;
        var req = _b.req;
        return __generator(this, function (_c) {
            user = req.user;
            if (!user)
                return [2 /*return*/, false]; // False means you can't access the image you're requesting and true means yes you can
            if (user.role === "admin")
                return [2 /*return*/, true];
            return [2 /*return*/, {
                    user: {
                        equals: req.user.id, // If we return a query constraint means, if this user owns this image, if the user property of the image that we're accessing, which is nothing else than the user field we are setting right at the bottom of this file that we are setting in the hook. So if this user field equals to the currently logged in user, then essentialy it's your image. Only allow access to your image if you're logged in.
                    },
                }];
        });
    }); };
};
exports.Media = {
    slug: "media",
    hooks: {
        beforeChange: [
            function (_a) {
                var req = _a.req, data = _a.data;
                return __assign(__assign({}, data), { user: req.user.id });
                // Each product image should be associated with a user directly instead of through the product (transitive relationship) is because when the user is in the backend and choosing from their existing media files, we don't want anyone to be able to acess all the media files from other people for example. The images that they could choose from for example, you as the logged in user should only be the ones that you own, and to enforce that we can link the image directly to a user which is going to make this implementation much easier.
            },
        ], // Before we change this product, we can invoke custom functions that we want to run. Payload gives us the request object and the actual data that we can use to execute this function.
    }, // Like events
    access: {
        read: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var referer;
            var req = _b.req;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        referer = req.headers.referer;
                        // If they're not logged in they can read all imaeges, so people browsing the front of your store should be able to read all images, Whereas people logged in into actual admin dashboard (which they'll always be logged in) they should not be able to view all products
                        if (!req.user || !(referer === null || referer === void 0 ? void 0 : referer.includes("sell"))) {
                            // Means that we're on the backend?
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, isAdminOrHasAccessToImages()({ req: req })];
                    case 1: return [2 /*return*/, _c.sent()];
                }
            });
        }); },
        delete: function (_a) {
            var req = _a.req;
            return isAdminOrHasAccessToImages()({ req: req });
        },
        update: isAdminOrHasAccessToImages(), // Basically the same thing
    }, // You can only delete your own image
    admin: {
        hidden: function (_a) {
            var user = _a.user;
            return user.role !== "admin";
        }, // Hide this in user dashboard, because it doesn't make sense to upload media which is not connected to a product.
    },
    // When you define an upload collection like Media with the upload configuration, Payload automatically generates URLs for your uploaded files. Even though you don't explicitly define a url field, Payload creates access points for your media files.
    upload: {
        staticURL: "/media", // Where we want the actual product files to live.
        staticDir: "media", // Media directory in our file sytem where the images will be stored, you can also export them to services like AWS S3/GCP Cloud Storage.
        imageSizes: [
            {
                name: "thumbnail",
                width: 400,
                height: 300,
                position: "centre",
            }, // Generating different versions of these images once they are uploaded. | optimize image loading times and sizes in runtime when user visit our page.
            {
                name: "card",
                width: 768,
                height: 1024,
                position: "centre",
            },
            {
                name: "tablet",
                width: 1024,
                height: undefined, // Retain the original aspect ratio.
                position: "centre",
            },
        ],
        mimeTypes: ["image/*"], // Allows all type of image extension (JPG, JPEG, PNG, etc).
    },
    fields: [
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            required: true, // We have to have a user.
            hasMany: false, // One image belong to one user.
            admin: {
                condition: function () { return false; },
            },
        },
    ],
};
