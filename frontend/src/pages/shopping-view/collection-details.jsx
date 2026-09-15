/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: collection-details.jsx
 * Purpose: Full page React view rendering a distinct route in the application.
 * Functions/Methods: 4
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCollectionById } from "@/services/api";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import useShopCartStore from "@/store/useShopCartStore";
import useAuthStore from "@/store/useAuthStore";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { getOptimizedImageUrl } from "@/lib/utils";

function ShoppingCollectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const addToCart = useShopCartStore((state) => state.addToCart);
  const fetchCartItems = useShopCartStore((state) => state.fetchCartItems);

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        const res = await getCollectionById(id);
        if (res.data.success) {
          setCollection(res.data.data);
        }
      } catch (err) {
        console.error(err);
        toast({ title: "Failed to load collection details", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [id, toast]);



  const handleGetProductDetails = (getCurrentProductId) => {
    navigate(`/shop/product/${getCurrentProductId}`);
  };

  const handleAddProductToCart = (getCurrentProductId, getTotalStock) => {
    if (!user) {
      toast({ title: "Please login to add to cart", variant: "destructive" });
      return;
    }
    addToCart({
      userId: user?.id,
      productId: getCurrentProductId,
      quantity: 1,
    }).then((data) => {
      if (data?.payload?.success) {
        fetchCartItems(user?.id);
        toast({
          title: "Product is added to cart",
        });
      }
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]">Loading collection details...</div>;
  }

  if (!collection) {
    return <div className="flex justify-center items-center h-[50vh]">Collection not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6 hover:bg-transparent hover:text-primary pl-0"
      >
        <ChevronLeft className="w-5 h-5 mr-1" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-12 md:mb-16">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative h-[320px] sm:h-[450px] md:h-[600px]">
          <img 
            src={getOptimizedImageUrl(collection.imageUrl, 800)} 
            alt={collection.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 text-white pr-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1.5 sm:mb-2">{collection.name}</h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-md">{collection.description}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">About this collection</h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed">
              Carefully curated by our styling experts, this complete collection takes the guesswork out of fashion. 
              {collection.description}
            </p>

            <div className="flex items-center justify-between mb-4 sm:mb-8 pb-4 sm:pb-8 border-b">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Items</p>
                <p className="text-2xl sm:text-3xl font-bold">{collection.products?.length || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Collection Price</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  ₹{collection.products?.reduce((acc, curr) => acc + (curr.salePrice > 0 ? curr.salePrice : curr.price), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-center text-gradient">Included in this collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {collection.products?.map((product) => (
            <ShoppingProductTile
              key={product.id}
              product={product}
              handleGetProductDetails={handleGetProductDetails}
              handleAddtoCart={handleAddProductToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShoppingCollectionDetails;
