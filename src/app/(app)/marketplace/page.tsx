
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';
import { Input } from "@/components/ui/input";
import { Search, Plus, ShoppingCart, Heart, MessageCircle } from "lucide-react";
import { CreateItemDialog } from "@/components/CreateItemDialog";
import { useState, useEffect, useMemo } from "react";
import type { Post as PostType } from "@/types";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

function EmptyMarketplace() {
    return (
        <div className="text-center py-20">
            <div className="inline-block bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl mb-6 shadow-sm">
                <ShoppingCart className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3">The marketplace is empty</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">Be the first to list an item for sale in your neighborhood and help your neighbors discover great deals!</p>
            <CreateItemDialog>
                <Button size="lg" className="shadow-sm">
                    <Plus className="mr-2 h-5 w-5" />
                    List Your First Item
                </Button>
            </CreateItemDialog>
        </div>
    )
}

export default function MarketplacePage() {
    const [items, setItems] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<PostType | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('category', 'For Sale')
                    .order('timestamp', { ascending: false });

                if (error) {
                    console.error('Error fetching marketplace items:', error);
                    return;
                }

                setItems(data as PostType[]);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching marketplace items:', error);
                setLoading(false);
            }
        };

        fetchItems();

        // Set up real-time subscription
        const channel = supabase
            .channel('marketplace-items')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'posts',
                filter: 'category=eq.For Sale'
            }, (payload) => {
                console.log('Marketplace realtime change received!', payload);
                
                if (payload.eventType === 'INSERT') {
                    // Add new item to the beginning of the list
                    const newItem = payload.new as PostType;
                    setItems(prevItems => [newItem, ...prevItems]);
                } else if (payload.eventType === 'UPDATE') {
                    // Update existing item in the list
                    const updatedItem = payload.new as PostType;
                    setItems(prevItems => 
                        prevItems.map(item => 
                            item.id === updatedItem.id ? updatedItem : item
                        )
                    );
                } else if (payload.eventType === 'DELETE') {
                    // Remove deleted item from the list
                    const deletedId = payload.old.id;
                    setItems(prevItems => 
                        prevItems.filter(item => item.id !== deletedId)
                    );
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredItems = useMemo(() => {
        if (!searchTerm) {
            return items;
        }
        return items.filter(item =>
            (item.text?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    const handleEditItem = (item: PostType) => {
        setEditingItem(item);
        setIsEditDialogOpen(true);
    };

    const handleDeleteItem = async (itemId: string) => {
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', itemId);
            
            if (error) {
                throw error;
            }
            
            toast({
                title: "Success",
                description: "Item deleted successfully",
            });
        } catch (error) {
            console.error("Failed to delete item:", error);
            toast({
                title: "Error",
                description: "Failed to delete item. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleEditDialogClose = () => {
        setEditingItem(null);
        setIsEditDialogOpen(false);
    };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">For Sale & Free</h2>
            <p className="text-muted-foreground">Buy and sell items in your neighborhood</p>
          </div>
          <CreateItemDialog>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 yrdly-shadow">
              <Plus className="w-4 h-4 mr-2" />
              Sell Item
            </Button>
          </CreateItemDialog>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search For sale & free" 
            className="pl-10 bg-card border-border focus:border-primary" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="p-0 overflow-hidden yrdly-shadow">
              <div className="relative cursor-pointer" onClick={() => handleEditItem(item)}>
                <img
                  src={item.image_urls?.[0] || "/placeholder.svg"}
                  alt={item.title || item.text}
                  className="w-full aspect-square object-cover"
                />
                <Badge
                  className={`absolute top-2 left-2 ${
                    item.price === 0
                      ? "bg-green-500 text-white"
                      : item.price && item.price > 20000
                        ? "bg-accent text-accent-foreground"
                        : "bg-primary text-primary-foreground"
                  }`}
                >
                  {item.price === 0 ? "FREE" : `₦${item.price?.toLocaleString()}`}
                </Badge>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-3 space-y-2">
                <h4 className="font-semibold text-foreground text-sm cursor-pointer" onClick={() => handleEditItem(item)}>
                  {item.title || item.text}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5 flex-shrink-0">
                    <AvatarImage src={item.author_image || "/placeholder.svg"} />
                    <AvatarFallback
                      className={`text-xs ${
                        item.price === 0 ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {item.author_name?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">{item.author_name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Posted {new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className={`flex-1 text-xs ${
                      item.price === 0
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : item.price && item.price > 20000
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                    onClick={() => handleEditItem(item)}
                  >
                    {item.price === 0 ? "Claim Free" : `Buy Now - ₦${item.price?.toLocaleString()}`}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`${
                      item.price === 0
                        ? "border-green-500 text-green-500"
                        : item.price && item.price > 20000
                          ? "border-accent text-accent"
                          : "border-primary text-primary"
                    } bg-transparent`}
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Implement message seller functionality
                      console.log('Message seller:', item.author_name)
                    }}
                  >
                    <MessageCircle className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        searchTerm ? (
          <div className="text-center py-20">
            <div className="inline-block bg-gradient-to-br from-muted/50 to-muted/30 p-6 rounded-2xl mb-6 shadow-sm">
              <Search className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-3">No items found for &quot;{searchTerm}&quot;</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">Try searching for something else or browse all available items.</p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <EmptyMarketplace />
        )
      )}
      {/* Edit Item Dialog */}
      {editingItem && (
        <CreateItemDialog 
          postToEdit={editingItem}
          open={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
        />
      )}
    </div>
  );
}
