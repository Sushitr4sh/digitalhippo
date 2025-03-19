import { User } from "../payload-types";
import { Access, CollectionConfig } from "payload/types";

// This is a function that return function
const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;

    if (!user) return false; // False means you can't access the image you're requesting and true means yes you can
    if (user.role === "admin") return true;

    return {
      user: {
        equals: req.user.id, // If we return a query constraint means, if this user owns this image, if the user property of the image that we're accessing, which is nothing else than the user field we are setting right at the bottom of this file that we are setting in the hook. So if this user field equals to the currently logged in user, then essentialy it's your image. Only allow access to your image if you're logged in.
      },
    };
  };

export const Media: CollectionConfig = {
  slug: "media",
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        return { ...data, user: req.user.id };
        // Each product image should be associated with a user directly instead of through the product (transitive relationship) is because when the user is in the backend and choosing from their existing media files, we don't want anyone to be able to acess all the media files from other people for example. The images that they could choose from for example, you as the logged in user should only be the ones that you own, and to enforce that we can link the image directly to a user which is going to make this implementation much easier.
      },
    ], // Before we change this product, we can invoke custom functions that we want to run. Payload gives us the request object and the actual data that we can use to execute this function.
  }, // Like events
  access: {
    read: async ({ req }) => {
      const referer = req.headers.referer; // Contains the URL where this request comes from

      // If they're not logged in they can read all imaeges, so people browsing the front of your store should be able to read all images, Whereas people logged in into actual admin dashboard (which they'll always be logged in) they should not be able to view all products
      if (!req.user || !referer?.includes("sell")) {
        // Means that we're on the backend?
        return true;
      }

      return await isAdminOrHasAccessToImages()({ req });
    },
    delete: ({ req }) => isAdminOrHasAccessToImages()({ req }),
    update: isAdminOrHasAccessToImages(), // Basically the same thing
  }, // You can only delete your own image
  admin: {
    hidden: ({ user }) => user.role !== "admin", // Hide this in user dashboard, because it doesn't make sense to upload media which is not connected to a product.
  },
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
        condition: () => false,
      },
    },
  ],
};
