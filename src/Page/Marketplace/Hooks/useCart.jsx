import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import useUser from "../../../Hooks/useUser";

const useCart = () => {
  const queryClient = useQueryClient();
  const axiosPublic = usePublicAxios();
  const { user, loading: userLoading } = useUser();
  const userId = user?.id;

  // ------------------ FETCH CART ------------------
  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axiosPublic.get(`/cart/${userId}`);
      return res.data.items;
    },
    enabled: !!userId, // only fetch if user exists
  });

  // ------------------ ADD TO CART ------------------
  const addToCartMutation = useMutation({
    mutationFn: async ({ product, quantity = 1 }) => {
      if (!userId) throw new Error("User not logged in");
      return await axiosPublic.post("/cart/add", { userId, product, quantity });
    },
    onMutate: async ({ product, quantity = 1 }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["cart", userId] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(["cart", userId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["cart", userId], (old = []) => {
        const itemExists = old.find((item) => (item._id || item.productId) === product._id);
        if (itemExists) {
          return old.map((item) =>
            (item._id || item.productId) === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...old, { ...product, quantity }];
      });

      // Return a context object with the snapshotted value
      return { previousCart };
    },
    onError: (err, newCart, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["cart", userId], context.previousCart);
      toast.error("Failed to add product to cart ❌");
    },
    onSuccess: () => {
      toast.success("Product added to cart! ✅");
    },
    onSettled: () => {
      // Always refetch after error or success to promise the server state is synced
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  // ------------------ UPDATE QUANTITY ------------------
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      if (!userId) throw new Error("User not logged in");
      return await axiosPublic.patch("/cart/update", { userId, productId, quantity });
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart", userId] });
      const previousCart = queryClient.getQueryData(["cart", userId]);

      queryClient.setQueryData(["cart", userId], (old = []) => {
        return old.map((item) =>
          (item._id || item.productId) === productId ? { ...item, quantity } : item
        );
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["cart", userId], context.previousCart);
      toast.error("Failed to update cart ❌");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  // ------------------ REMOVE FROM CART ------------------
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId) => {
      if (!userId) throw new Error("User not logged in");
      return await axiosPublic.delete(`/cart/remove/${productId}?userId=${userId}`);
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["cart", userId] });
      const previousCart = queryClient.getQueryData(["cart", userId]);

      queryClient.setQueryData(["cart", userId], (old = []) => {
        return old.filter((item) => (item._id || item.productId) !== productId);
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["cart", userId], context.previousCart);
      toast.error("Failed to remove product ❌");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  // ------------------ HELPERS ------------------
  const addToCart = (product, quantity = 1) => addToCartMutation.mutate({ product, quantity });
  const updateQuantity = (productId, quantity) => updateQuantityMutation.mutate({ productId, quantity });
  const removeFromCart = (productId) => removeFromCartMutation.mutate(productId);

  const getTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  return {
    cartItems,
    isLoading: cartLoading || userLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    getTotal,
  };
};

export default useCart;
