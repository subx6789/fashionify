import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";

function ShoppingOutfitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchOutfitDetails = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/outfits/${id}`);
        if (res.data.success) {
          setOutfit(res.data.data);
        }
      } catch (err) {
        console.error(err);
        toast({ title: "Failed to load outfit details", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchOutfitDetails();
  }, [id, toast]);

  const handleAddOutfitToCart = async () => {
    if (!user) {
      toast({ title: "Please login to add to cart", variant: "destructive" });
      return;
    }
    
    setAddingToCart(true);
    let successCount = 0;
    
    try {
      for (const product of outfit.products) {
        const res = await dispatch(
          addToCart({
            userId: user?.id,
            productId: product?.id,
            quantity: 1,
          })
        );
        
        if (res?.payload?.success) {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: `Added ${successCount} items from the look to your cart!` });
      } else {
        toast({ title: "Failed to add items", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleGetProductDetails = (getCurrentProductId) => {
    navigate(`/shop/product/${getCurrentProductId}`);
  };

  const handleAddProductToCart = (getCurrentProductId, getTotalStock) => {
    if (!user) {
      toast({ title: "Please login to add to cart", variant: "destructive" });
      return;
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]">Loading outfit details...</div>;
  }

  if (!outfit) {
    return <div className="flex justify-center items-center h-[50vh]">Outfit not found.</div>;
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="rounded-3xl overflow-hidden shadow-2xl relative h-[600px]">
          <img 
            src={outfit.imageUrl} 
            alt={outfit.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-4xl font-extrabold mb-2">{outfit.name}</h1>
            <p className="text-white/80 max-w-md">{outfit.description}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="bg-card rounded-3xl p-8 border shadow-sm">
            <h2 className="text-2xl font-bold mb-6">About this look</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Carefully curated by our styling experts, this complete look takes the guesswork out of fashion. 
              {outfit.description}
            </p>

            <div className="flex items-center justify-between mb-8 pb-8 border-b">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Items</p>
                <p className="text-3xl font-bold">{outfit.products?.length || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Look Price</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{outfit.products?.reduce((acc, curr) => acc + (curr.salePrice > 0 ? curr.salePrice : curr.price), 0)}
                </p>
              </div>
            </div>

            <Button
              onClick={handleAddOutfitToCart}
              disabled={addingToCart}
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-[1.02]"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {addingToCart ? "Adding..." : "Add Entire Look to Cart"}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gradient">Included in this look</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {outfit.products?.map((product) => (
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

export default ShoppingOutfitDetails;
