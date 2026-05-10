import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Stack,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Search, ShoppingCart, Package } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/firebase/compat";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  startup_id: string;
  startups?: {
    name: string;
  };
}

export default function Marketplace() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, startups(name)")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  const handleOrder = async (product: Product) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to place an order",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("orders").insert({
      customer_id: user.id,
      product_id: product.id,
      startup_id: product.startup_id,
      quantity: 1,
      total_amount: product.price,
      status: "pending",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Order placed!",
        description: "Your order has been submitted successfully",
      });
    }
  };

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <DashboardLayout>
        <Box className="min-h-screen flex items-center justify-center">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <Box className="mb-8">
          <Typography variant="h4" className="font-bold mb-2">
            Marketplace
          </Typography>
          <Typography variant="body1" className="text-muted-foreground">
            Discover products and services from innovative startups
          </Typography>
        </Box>

        {/* Filters */}
        <Paper elevation={0} className="p-4 rounded-xl border border-border mb-6">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
          >
            <TextField
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              className="flex-1"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Paper elevation={0} className="p-12 rounded-xl border border-border text-center">
            <Box className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </Box>
            <Typography variant="h6" className="font-medium mb-2">
              No products found
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Check back later for new products"}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                <Card variant="outlined" className="h-full flex flex-col">
                  <CardMedia
                    component="div"
                    className="h-48 bg-secondary flex items-center justify-center"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground" />
                    )}
                  </CardMedia>
                  <CardContent className="flex-1">
                    <Typography variant="h6" className="font-semibold mb-1">
                      {product.name}
                    </Typography>
                    {product.startups?.name && (
                      <Chip
                        label={product.startups.name}
                        size="small"
                        variant="outlined"
                        className="mb-2"
                      />
                    )}
                    <Typography
                      variant="body2"
                      className="text-muted-foreground line-clamp-2 mb-2"
                    >
                      {product.description || "No description available"}
                    </Typography>
                    <Typography variant="h6" className="font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCart className="w-4 h-4" />}
                      onClick={() => handleOrder(product)}
                      disabled={profile?.role === "founder"}
                    >
                      {profile?.role === "founder" ? "View Only" : "Order Now"}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
}
