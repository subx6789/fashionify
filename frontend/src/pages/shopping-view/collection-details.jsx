import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCollectionById } from "@/services/api";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";

function ShoppingCollectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="rounded-3xl overflow-hidden shadow-2xl relative h-[600px]">
          <img 
            src={collection.imageUrl} 
            alt={collection.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-4xl font-extrabold mb-2">{collection.name}</h1>
            <p className="text-white/80 max-w-md">{collection.description}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="bg-card rounded-3xl p-8 border shadow-sm">
            <h2 className="text-2xl font-bold mb-6">About this collection</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Carefully curated by our styling experts, this complete collection takes the guesswork out of fashion. 
              {collection.description}
            </p>

            <div className="flex items-center justify-between mb-8 pb-8 border-b">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Items</p>
                <p className="text-3xl font-bold">{collection.products?.length || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Collection Price</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{collection.products?.reduce((acc, curr) => acc + (curr.salePrice > 0 ? curr.salePrice : curr.price), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gradient">Included in this collection</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
