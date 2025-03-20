import { PRODUCT_CATEGORIES } from "../../config";
import { CollectionConfig } from "payload/types";

// CollectionConfig let us know what we can pass in here/valid
export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
  },
  // Who can access which part of which products
  access: {},
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
