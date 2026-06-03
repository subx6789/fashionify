import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import UserProfile from "@/components/shopping-view/user-profile";
import { User, MapPin, ShoppingBag } from "lucide-react";

function ShoppingAccount() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <div className="relative h-[350px] w-full overflow-hidden">
        <img
          src={accImg}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-2 tracking-tight">My Account</h1>
          <p className="text-muted-foreground font-medium">Manage your profile, orders, and addresses.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 lg:px-8 py-8 -mt-6 relative z-10 max-w-6xl">
        <div className="flex flex-col rounded-3xl border border-primary/10 bg-background/95 backdrop-blur-3xl p-6 md:p-10 shadow-2xl shadow-primary/5">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-2 bg-muted/40 p-2 rounded-2xl mb-8">
              <TabsTrigger value="profile" className="rounded-xl font-bold py-3 data-[state=active]:bg-gradient-premium data-[state=active]:text-primary-foreground transition-all">
                <User className="w-4 h-4 mr-2 hidden sm:block" /> Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-xl font-bold py-3 data-[state=active]:bg-gradient-premium data-[state=active]:text-primary-foreground transition-all">
                <ShoppingBag className="w-4 h-4 mr-2 hidden sm:block" /> Orders
              </TabsTrigger>
              <TabsTrigger value="address" className="rounded-xl font-bold py-3 data-[state=active]:bg-gradient-premium data-[state=active]:text-primary-foreground transition-all">
                <MapPin className="w-4 h-4 mr-2 hidden sm:block" /> Address
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-0 outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <UserProfile />
            </TabsContent>
            
            <TabsContent value="orders" className="mt-0 outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <ShoppingOrders />
            </TabsContent>
            
            <TabsContent value="address" className="mt-0 outline-none animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <Address />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
