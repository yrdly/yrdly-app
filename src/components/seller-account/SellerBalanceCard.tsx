"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-supabase-auth';
import { PayoutService, SellerBalance } from '@/lib/payout-service';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export function SellerBalanceCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [balance, setBalance] = useState<SellerBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchBalance();
  }, [user]);

  const fetchBalance = async () => {
    try {
      const data = await PayoutService.getSellerBalance(user!.id);
      setBalance(data);
    } catch (error) {
      console.error('Error fetching seller balance:', error);
      toast({
        title: "Error",
        description: "Failed to load balance information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayouts = () => {
    router.push('/profile/payouts');
  };

  const handleSetupAccount = () => {
    router.push('/profile/seller-account');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Seller Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Seller Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-orange-500 mx-auto" />
          <div>
            <h3 className="font-semibold">No Earnings Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start selling items to see your earnings here.
            </p>
          </div>
          <Button onClick={() => router.push('/marketplace')}>
            List an Item
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Seller Earnings
        </CardTitle>
        <CardDescription>
          Your earnings from completed sales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Balance */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            ₦{balance.availableBalance.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Available Balance</p>
        </div>

        {/* Balance Breakdown */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              ₦{balance.totalEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-green-700">Total Earnings</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">
              ₦{balance.completedPayouts.toLocaleString()}
            </div>
            <div className="text-xs text-blue-700">Paid Out</div>
          </div>
        </div>

        {/* Pending Payouts */}
        {balance.pendingPayouts > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-yellow-800">
                  ₦{balance.pendingPayouts.toLocaleString()} Pending
                </div>
                <div className="text-xs text-yellow-700">
                  Processing payout requests
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={handleViewPayouts}
            className="w-full"
            variant="outline"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            View Payout History
          </Button>
          
          {balance.availableBalance > 0 && (
            <Button 
              onClick={handleSetupAccount}
              className="w-full"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Setup Payout Account
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Platform fee: 2% per transaction</p>
          <p>Payouts processed automatically</p>
        </div>
      </CardContent>
    </Card>
  );
}
