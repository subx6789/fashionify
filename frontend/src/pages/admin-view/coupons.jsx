import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Tag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCoupons = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/coupons");
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountPercentage) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/coupons", {
        code,
        discountPercentage: Number(discountPercentage)
      });
      if (res.data.success) {
        toast({ title: "Coupon created!" });
        setCode("");
        setDiscountPercentage("");
        fetchCoupons();
      }
    } catch (err) {
      toast({ title: "Error creating coupon", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:8080/api/coupons/${id}`);
      if (res.data.success) {
        toast({ title: "Coupon deleted" });
        fetchCoupons();
      }
    } catch (err) {
      toast({ title: "Error deleting coupon", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Tag className="w-8 h-8 text-primary" /> Promo Codes
      </h1>
      
      <div className="bg-card p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Create New Coupon</h2>
        <form onSubmit={handleCreateCoupon} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label>Coupon Code</Label>
            <Input 
              placeholder="e.g. SUMMER25" 
              value={code} 
              onChange={e => setCode(e.target.value.toUpperCase())} 
            />
          </div>
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label>Discount Percentage (%)</Label>
            <Input 
              type="number" 
              placeholder="e.g. 25" 
              value={discountPercentage} 
              onChange={e => setDiscountPercentage(e.target.value)} 
            />
          </div>
          <Button type="submit" disabled={loading} className="font-bold">
            <Plus className="w-4 h-4 mr-2" /> Add Coupon
          </Button>
        </form>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Active Coupons</h2>
          {coupons.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No coupons available.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {coupons.map(coupon => (
                <div key={coupon.id} className="p-4 border rounded-xl flex justify-between items-center bg-muted/30">
                  <div>
                    <h3 className="font-bold text-lg text-primary">{coupon.code}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{coupon.discountPercentage}% OFF</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCoupons;
