import { useRouter } from "next/navigation";
import { toast } from "sonner";

// It must be prefixed with use, so it can access all react apis (context, state, useEffect, useRouter etc) all that works not in regular functions if they're not inside a comonent, but it does work in hooks.
export const useAuth = () => {
  const router = useRouter();
  const signOut = async () => {
    try {
      const res = await fetch(
        // Provided by payload -> It invalidate the token and remove it from the response
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "applicaiton/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      toast.success("Signed out successfully.");

      router.push("/sign-in");
      router.refresh();
    } catch (err) {
      toast.error("Couldn't sign out, please try again.");
    }
  };

  return { signOut };
};
