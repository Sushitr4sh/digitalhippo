import { Access, CollectionConfig } from "payload/types";

const yourOwn: Access = ({ req: { user } }) => {
  // Destructure the user right away, but user will have any type
  if (user.role === "admin") return true;

  return {
    // Else return a quer constraint where the user id of the order, needs to match or needs to equal the currently logged in user id. Which means you can only read your own order.
    user: {
      equals: user?.id,
    },
  };
};

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "Your Orders",
    description: "A summary of all your orders on DigitalHippo",
  },
  // Who can create order/who can read orders
  access: {
    create: ({ req }) => req.user.role === "admin",
    read: yourOwn,
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin",
  },
  fields: [
    {
      name: "_isPaid",
      type: "checkbox",
      access: {
        // This is access on the field level, its different from access on the colelction level
        read: ({ req }) => req.user.role === "admin",
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      required: true,
    },
    {
      name: "user", // Who made this order?
      type: "relationship",
      admin: {
        hidden: true,
      },
      relationTo: "users",
      required: true,
    },
    {
      name: "products", // What products are in this order?
      type: "relationship",
      relationTo: "products",
      required: true,
      hasMany: true,
    },
  ],
};
