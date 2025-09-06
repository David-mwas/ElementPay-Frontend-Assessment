import { addSubscriber, orders } from "../../../_store";

export async function GET(
  req: Request,
  { params }: { params: { order_id: string } }
) {
  const { order_id } = params;
  const order = orders.get(order_id);
  if (!order) {
    return new Response(
      JSON.stringify({
        error: "order_not_found",
        message: `No order with id ${order_id}`,
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  let keepAlive: ReturnType<typeof setInterval>;
  let cleanup: () => void;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encode(`data: ${JSON.stringify({ status: order.status })}\n\n`)
      );

      interface Payload {
        status: string;
        [key: string]: unknown;
      }

      type SendFn = (payload: string) => void;

      const sendFn: SendFn = (payload: string) => {
        controller.enqueue(encode(`data: ${payload}\n\n`));
      };
      cleanup = addSubscriber(order_id, sendFn);

      keepAlive = setInterval(() => {
        controller.enqueue(encode(`: ping\n\n`));
      }, 20_000);
    },
    cancel() {
      clearInterval(keepAlive);
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });

  function encode(s: string) {
    return new TextEncoder().encode(s);
  }
}
