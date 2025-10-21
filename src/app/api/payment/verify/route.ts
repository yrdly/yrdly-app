import { NextRequest, NextResponse } from 'next/server';
import { FlutterwaveService } from '@/lib/flutterwave-service';
import { EscrowService } from '@/lib/escrow-service';
import { ItemTrackingService } from '@/lib/item-tracking-service';
import { EscrowStatus } from '@/types/escrow';

export async function POST(request: NextRequest) {
  try {
    const { transactionReference } = await request.json();

    if (!transactionReference) {
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Flutterwave
    const verificationResult = await FlutterwaveService.verifyPayment(transactionReference);

    if (verificationResult.success) {
      // Update escrow transaction status
      await EscrowService.updateStatus(
        verificationResult.transactionReference!,
        EscrowStatus.PAID,
        {
          paymentReference: transactionReference,
          paidAt: new Date().toISOString(),
        }
      );

      // Mark item as sold
      const { data: transaction } = await EscrowService.getTransaction(verificationResult.transactionReference!);
      if (transaction) {
        await ItemTrackingService.markItemAsSold(
          transaction.item_id,
          transaction.id,
          transaction.buyer_id
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        transactionId: verificationResult.transactionReference,
        amount: verificationResult.amount,
      });
    } else {
      return NextResponse.json(
        { error: verificationResult.error || 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
