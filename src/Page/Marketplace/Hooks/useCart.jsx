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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
      toast.success("Product added to cart! ✅");
    },
    onError: () => {
      toast.error("Failed to add product to cart ❌");
    },
  });

  // ------------------ UPDATE QUANTITY ------------------
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      if (!userId) throw new Error("User not logged in");
      return await axiosPublic.patch("/cart/update", { userId, productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
    onError: () => {
      toast.error("Failed to update cart ❌");
    },
  });

  // ------------------ REMOVE FROM CART ------------------
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId) => {
      if (!userId) throw new Error("User not logged in");
      return await axiosPublic.delete(`/cart/remove/${productId}?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
    onError: () => {
      toast.error("Failed to remove product ❌");
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
