import { createClient } from '@supabase/supabase-js';
import { DRINK_MENU } from '../constants';
import { OrderItem } from '../types';

/**
 * Supabase 클라이언트 설정
 * - Vite는 빌드 시점에 VITE_ 로 시작하는 환경변수만 코드에 주입합니다.
 * - Vercel 배포 시: Project Settings → Environment Variables 에 두 값을 등록한 뒤 "재배포" 해야 반영됩니다.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 환경변수가 없습니다. ' +
      'Vercel의 Environment Variables 설정을 확인하고 재배포하세요.'
  );
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

const TABLE = 'cafe_menu';

// DB 레코드(snake_case) 타입
interface CafeMenuRow {
  id: string;
  customer_name: string;
  phone: string | null;
  drink_name: string;
  size: 'S' | 'M' | 'L';
  options: string[] | null;
  quantity: number;
  requests: string | null;
  total_price: number;
  order_status: OrderItem['orderStatus'];
  created_at: string;
}

// DB 레코드 → 화면용 OrderItem 변환
const rowToOrder = (row: CafeMenuRow): OrderItem => ({
  id: row.id,
  customerName: row.customer_name,
  phone: row.phone ?? '',
  drinkId: DRINK_MENU.find((d) => d.name === row.drink_name)?.id ?? '',
  drinkName: row.drink_name,
  size: row.size,
  options: row.options ?? [],
  quantity: row.quantity,
  requests: row.requests ?? '',
  totalPrice: row.total_price,
  orderStatus: row.order_status,
  createdAt: new Date(row.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
});

const requireClient = () => {
  if (!supabase) throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
  return supabase;
};

// 주문 목록 조회 (최신순)
export const fetchOrders = async (): Promise<OrderItem[]> => {
  const { data, error } = await requireClient()
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as CafeMenuRow[]).map(rowToOrder);
};

// 새 주문 저장 (id, created_at 은 DB에서 자동 생성)
export const insertOrder = async (order: OrderItem): Promise<OrderItem> => {
  const { data, error } = await requireClient()
    .from(TABLE)
    .insert({
      customer_name: order.customerName,
      phone: order.phone || null,
      drink_name: order.drinkName,
      size: order.size,
      options: order.options,
      quantity: order.quantity,
      requests: order.requests || null,
      total_price: order.totalPrice,
      order_status: order.orderStatus,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToOrder(data as CafeMenuRow);
};

// 주문 상태 변경
export const updateOrderStatus = async (id: string, status: OrderItem['orderStatus']) => {
  const { error } = await requireClient().from(TABLE).update({ order_status: status }).eq('id', id);
  if (error) throw error;
};

// 주문 삭제
export const deleteOrder = async (id: string) => {
  const { error } = await requireClient().from(TABLE).delete().eq('id', id);
  if (error) throw error;
};
