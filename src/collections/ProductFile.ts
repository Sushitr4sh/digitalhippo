import { User } from "../payload-types";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";

const addUser: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.id };
};

const yourOwnAndPurchased: Access = async ({ req }) => {
  const user = req.user as User | null;

  if (user?.role === "admin") return true;
  if (!user) return false;

  // Fetch your own products
  const { docs: products } = await req.payload.find({
    collection: "products",
    depth: 0, // When we search for products, each product is attached to user by an id, and if we had a depth of one, it would actually fetch the entire user that is attached to this product but we only care about the id.
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const ownProductFileIds = products.map((prod) => prod.product_files).flat();

  // Fetch your purchased products
  const { docs: orders } = await req.payload.find({
    collection: "orders",
    depth: 2, // Fetching also the user and the product associated in this order
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const purchasedProductFileIds = orders
    .map((order) => {
      return order.products.map((product) => {
        if (typeof product === "string")
          return req.payload.logger.error(
            "Search depth not sufficient to find purchased file IDs"
          );

        // Else if it's an actual product, we're going to return a ternary. If it's a string, we want to return the actual product files. And if it's not a string, in that case we know it's the entire product so we want to return the array of id.
        return typeof product.product_files === "string"
          ? product.product_files
          : product.product_files.id;
      });
    })
    .filter(Boolean)
    .flat();

  return {
    id: [...ownProductFileIds, ...purchasedProductFileIds], // Check if the file that you're requesting in either of these two arrays
  };
};

export const ProductFiles: CollectionConfig = {
  slug: "product_files",
  admin: {
    hidden: ({ user }) => user.role !== "admin",
  },
  hooks: {
    beforeChange: [addUser],
  },
  access: {
    read: yourOwnAndPurchased,
    // The product files that you should be able to see are either your own or the ones you purchased.
    // For create we don't need to define, because the default is you need to log in and as long as you logged in you can upload a product file
    update: ({ req }) => req.user.role === "admin", // Once you upload a product file, normal users are not going to be able to change it.
    delete: ({ req }) => req.user.role === "admin", // They should also not be able to delete the product file once the upload, because imagine you buy a product and later on the owner of that product suddenly deletes the product file. If normal users want to request a deletion, they can do so through admins.
  },
  upload: {
    staticURL: "/product_files",
    staticDir: "product_files",
    mimeTypes: ["image/*", "font/*", "application/postscript"],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      admin: {
        condition: () => false,
      },
      hasMany: false,
      required: true,
    },
  ],
};
