import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Status = "pending" | "approved" | "rejected";
type PaymentMethod = "bank-transfer" | "kakaopay" | "toss";

type DonationRow = {
  id: string;
  amount: number;
  message: string | null;
  status: Status;
  created_at: string;
  approved_at: string | null;
  nickname: string;
  payment_method: PaymentMethod;
  order_id: string;
};

type PendingDonationState = {
  donations: DonationRow[];
  error: string | null;
};

const ADMIN_COOKIE = "josoeun-admin";
const ADMIN_COOKIE_VALUE = "verified";

function formatWon(amount: number) {
  return `${(amount ?? 0).toLocaleString("ko-KR")}원`;
}

function formatDate(dateValue: string) {
  if (!dateValue) return "제출 시간 없음";

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(dateValue));
}

async function getIsLoggedIn() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === ADMIN_COOKIE_VALUE;
}

async function getPendingDonations(): Promise<PendingDonationState> {
  const { data, error } = await supabaseServer
    .from("donations")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return {
      donations: [],
      error: error.message,
    };
  }

  return {
    donations: (data ?? []) as DonationRow[],
    error: null,
  };
}

async function loginAdmin(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    redirect("/admin?error=config");
  }

  if (password !== adminPassword) {
    redirect("/admin?error=login");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 3,
  });

  redirect("/admin");
}

async function logoutAdmin() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin");
}

async function approveDonation(formData: FormData) {
  "use server";

  if (!(await getIsLoggedIn())) redirect("/admin");

  const donationId = String(formData.get("donationId") ?? "");

  if (!donationId) return;

  await supabaseServer
    .from("donations")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", donationId);

  revalidatePath("/admin");
}

async function rejectDonation(formData: FormData) {
  "use server";

  if (!(await getIsLoggedIn())) redirect("/admin");

  const donationId = String(formData.get("donationId") ?? "");

  if (!donationId) return;

  await supabaseServer
    .from("donations")
    .update({
      status: "rejected",
    })
    .eq("id", donationId);

  revalidatePath("/admin");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const isLoggedIn = await getIsLoggedIn();
  const params = await searchParams;

  if (!isLoggedIn) {
    const loginFailed = params?.error === "login";
    const missingConfig = params?.error === "config";

    return (
      <main className="admin-shell admin-login-shell">
        <section className="admin-login-panel">
          <div className="admin-kicker">관리자 페이지</div>
          <h1>후원 승인 로그인</h1>
          <p>
            계좌이체 후원을 확인하려면 관리자 비밀번호를 입력해주세요.
          </p>

          <form action={loginAdmin} className="admin-login-form">
            <label htmlFor="admin-password">비밀번호</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="관리자 비밀번호"
              required
            />

            {missingConfig && (
              <div className="admin-form-error">
                ADMIN_PASSWORD 환경 변수가 아직 설정되지 않았어요.
              </div>
            )}

            {loginFailed && (
              <div className="admin-form-error">
                비밀번호가 올바르지 않아요.
              </div>
            )}

            <button type="submit">로그인</button>
          </form>
        </section>
      </main>
    );
  }

  const { donations, error } = await getPendingDonations();
  const pendingTotal = donations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );

  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <header className="admin-header">
          <div>
            <div className="admin-kicker">관리자 페이지</div>
            <h1>입금 확인 대기</h1>
            <p>
              은행 앱에서 입금자명과 금액을 확인한 뒤 승인 또는 거절을
              선택해주세요.
            </p>
          </div>

          <form action={logoutAdmin}>
            <button className="admin-logout-btn" type="submit">
              로그아웃
            </button>
          </form>
        </header>

        <section className="admin-summary-grid" aria-label="후원 승인 요약">
          <div className="admin-summary-box">
            <span>대기 건수</span>
            <strong>{donations.length.toLocaleString("ko-KR")}건</strong>
          </div>

          <div className="admin-summary-box">
            <span>대기 금액</span>
            <strong>{formatWon(pendingTotal)}</strong>
          </div>
        </section>

        {error ? (
          <section className="admin-empty-state">
            <h2>대기 후원을 불러오지 못했어요</h2>
            <p>
              donations 테이블에 status 컬럼이 아직 없거나 Supabase 환경
              변수가 연결되지 않았을 수 있어요.
            </p>
            <pre>{error}</pre>
          </section>
        ) : donations.length === 0 ? (
          <section className="admin-empty-state">
            <h2>확인할 후원이 없어요</h2>
            <p>pending 상태의 계좌이체 후원이 생기면 여기에 표시됩니다.</p>
          </section>
        ) : (
          <section className="admin-donation-list" aria-label="대기 후원 목록">
            {donations.map((donation) => (
              <article className="admin-donation-card" key={donation.id}>
                <div className="admin-donation-main">
                  <div className="admin-donation-topline">
                    <strong>{donation.nickname}</strong>
                    <span>{formatDate(donation.created_at)}</span>
                  </div>

                  <div className="admin-donation-amount">
                    {formatWon(donation.amount)}
                  </div>

                  <dl className="admin-donation-details">
                    <div>
                      <dt>입금자명</dt>
                      <dd>{donation.nickname || "미입력"}</dd>
                    </div>

                    <div>
                      <dt>결제 방식</dt>
                      <dd>{donation.payment_method || "banktransfer"}</dd>
                    </div>

                    <div>
                      <dt>주문 ID</dt>
                      <dd>{donation.order_id}</dd>
                    </div>
                  </dl>

                  {donation.message && (
                    <p className="admin-donation-message">
                      {donation.message}
                    </p>
                  )}
                </div>

                <div className="admin-donation-actions">
                  <form action={approveDonation}>
                    <input
                      name="donationId"
                      type="hidden"
                      value={donation.id}
                    />
                    <button className="admin-approve-btn" type="submit">
                      승인
                    </button>
                  </form>

                  <form action={rejectDonation}>
                    <input
                      name="donationId"
                      type="hidden"
                      value={donation.id}
                    />
                    <button className="admin-reject-btn" type="submit">
                      거절
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
