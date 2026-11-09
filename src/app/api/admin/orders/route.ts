import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const paymentStatuses = ["pending", "paid", "failed"] as const;

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized access." },
      { status: 401 }
    );
  }

  try {
    const rawOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    const orders = rawOrders.map((order: any) => {
      const cust = (order.customer as any) || {};
      return {
        _id: order.id,
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          name: cust.name || "",
          email: cust.email || "",
          phone: cust.phone || "",
        },
        shippingAddress: cust.shippingAddress || null,
        items: order.items,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        shippingCharge: Number(order.shippingFee),
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch orders." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const orderId = String(body.orderId || "").trim();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "A valid order ID is required." },
        { status: 400 }
      );
    }

    const data: { orderStatus?: string; paymentStatus?: string } = {};

    if (body.orderStatus !== undefined) {
      if (
        !orderStatuses.includes(
          body.orderStatus as (typeof orderStatuses)[number]
        )
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid order status." },
          { status: 400 }
        );
      }

      data.orderStatus = body.orderStatus;
    }

    if (body.paymentStatus !== undefined) {
      if (
        !paymentStatuses.includes(
          body.paymentStatus as (typeof paymentStatuses)[number]
        )
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid payment status." },
          { status: 400 }
        );
      }

      data.paymentStatus = body.paymentStatus;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid updates provided." },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: {
        _id: updated.id,
        id: updated.id,
        orderNumber: updated.orderNumber,
        customer: updated.customer,
        shippingAddress: (updated.customer as any)?.shippingAddress,
        items: updated.items,
        subtotal: Number(updated.subtotal),
        shippingFee: Number(updated.shippingFee),
        total: Number(updated.total),
        paymentMethod: updated.paymentMethod,
        paymentStatus: updated.paymentStatus,
        orderStatus: updated.orderStatus,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    console.error("Update order error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update order." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let orderId = searchParams.get("id");

    if (!orderId) {
      try {
        const body = await request.json();
        orderId = body?.id || body?.orderId;
      } catch {
        // empty body ok
      }
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required." },
        { status: 400 }
      );
    }

    const res = await prisma.order.deleteMany({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
    });

    if (res.count === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete order." },
      { status: 500 }
    );
  }
}
