import {
  AfterChangeHook,
  BeforeChangeHook,
} from "payload/dist/collections/config/types";
import { PRODUCT_CATEGORIES } from "../../config";
import { Access, CollectionConfig } from "payload/types";
import { Product, User } from "../../payload-types";
import { stripe } from "../../lib/stripe";

const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
  const user = req.user;

  return { ...data, user: user.id };
};

// Assign product to a user
const syncUser: AfterChangeHook<Product> = async ({ req, doc }) => {
  const fullUser = await req.payload.findByID({
    collection: "users",
    id: req.user.id,
  });

  if (fullUser && typeof fullUser === "object") {
    const { products } = fullUser;

    // All of the ids of all the products this user currently has, so that we can add the one we're currently creating right behind
    const allIDs = [
      ...(products?.map((product) =>
        typeof product === "object" ? product.id : product
      ) || []), // [] means user doesn't have any product yet
    ];

    const createdProductIDs = allIDs.filter(
      (id, index) => allIDs.indexOf(id) === index
    );

    const dataToUpdate = [...createdProductIDs, doc.id];

    await req.payload.update({
      collection: "users",
      id: fullUser.id,
      data: {
        products: dataToUpdate,
      },
    });
  }
};

const isAdminOrHasAccess =
  (): Access =>
  ({ req: { user: _user } }) => {
    const user = _user as User | undefined;

    if (!user) return false;
    if (user.role === "admin") return true;

    // Only your own product
    const userProductIDs = (user.products || []).reduce<Array<string>>(
      (acc, product) => {
        if (!product) return acc;
        if (typeof product === "string") {
          acc.push(product);
        } else {
          acc.push(product.id);
        }

        return acc;
      },
      []
    );

    return {
      // The id of the product that we're requesting currently is in the userProductIDs, your product, my product it depends on user that is currently logged in.
      id: {
        in: userProductIDs,
      },
    };
  };

// CollectionConfig let us know what we can pass in here/valid
export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
  },
  // Who can access which part of which products
  access: {
    read: isAdminOrHasAccess(),
    update: isAdminOrHasAccess(),
    delete: isAdminOrHasAccess(),
  },
  hooks: {
    // We can execute our own code when a product is created
    afterChange: [syncUser],
    beforeChange: [
      addUser,
      async (args) => {
        if (args.operation === "create") {
          // This mean if we are creating a new product and new product in stripe as well
          const data = args.data as Product;

          // Create a product in stripe which is nothing else than the transaction fee product that we made in stripe dashboard
          const createdProduct = await stripe.products.create({
            name: data.name,
            default_price_data: {
              currency: "USD",
              unit_amount: Math.round(data.price * 100), // Price of the product in cents not dollar
            },
          });

          const updated: Product = {
            ...data,
            stripeId: createdProduct.id,
            priceId: createdProduct.default_price as string, // Price id is the transaction fee api id, that's how stripe knows how much a product costs internally
          };

          return updated;
        } else if (args.operation === "update") {
          // We don't want to create new product in stripe if we're updating
          const data = args.data as Product;

          const updatedProduct = await stripe.products.update(data.stripeId!, {
            name: data.name,
            default_price: data.priceId!,
          });

          const updated: Product = {
            ...data,
            stripeId: updatedProduct.id,
            priceId: updatedProduct.default_price as string,
          };

          return updated;
        }
      },
    ],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false, // One product can't be created by multiple user
      admin: {
        condition: () => false, // Hide this field from the admin dashboard
      },
    },
    {
      name: "name",
      label: "Name", // Which is going to be visible in the admin dashboard
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea", // Use rich text if you want to enable font formatting
      label: "Product details",
    },
    {
      name: "price",
      label: "Price in USD",
      min: 0,
      max: 1000,
      type: "number",
      required: true,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
      required: true,
    },
    {
      name: "product_files",
      label: "Product file(s)",
      type: "relationship",
      required: true,
      relationTo: "product_files", // Reference to product_files collection
      hasMany: false, // Each product has exactly one product file
    },
    {
      name: "approvedForSale", // Only admin should be able to change this
      label: "Product Status",
      type: "select",
      defaultValue: "pending",
      access: {
        // req to check if the user allowed to do this or not (contain user role)
        create: ({ req }) => req.user.role === "admin",
        read: ({ req }) => req.user.role === "admin",
        update: ({ req }) => req.user.role === "admin",
      },
      options: [
        {
          label: "Pending verification",
          value: "pending",
        },
        {
          label: "Approved",
          value: "approved",
        },
        {
          label: "Denied",
          value: "denied",
        },
      ],
    },
    {
      name: "priceId", // This is a field we receive from stripe later on
      access: {
        create: () => false, // No one can change this field even the admin except us through the getPayloadClient code. Good idea to set these access policies to false, because we know we never need/should change them.
        read: () => false,
        update: () => false,
      },
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "stripeId", // Correspond to certain product. This is a field we receive from stripe later on
      access: {
        create: () => false, // No one can change this field even the admin except us through the getPayloadClient code. Good idea to set these access policies to false, because we know we never need/should change them.
        read: () => false,
        update: () => false,
      },
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "images",
      type: "array", // Allow multiple images to be passed into here
      label: "Product images",
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: "Image",
        plural: "Images",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
  ],
};
