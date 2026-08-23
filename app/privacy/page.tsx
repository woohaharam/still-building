import type { Metadata } from 'next';
import Container from '@/components/Container';
import { siteAuthor, siteEmail, siteTitle, siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: `${siteTitle}이 어떤 정보를 다루고 무엇을 다루지 않는지.`,
  alternates: { canonical: `${siteUrl}/privacy` },
};

/** 방침을 고칠 때마다 여기도 같이 올려야 해요. */
const EFFECTIVE_DATE = '2026년 8월 23일';

/**
 * 처리를 맡긴 곳. 전부 해외 사업자라 개인정보가 국외로 나갑니다.
 * 서비스를 붙이거나 뗄 때 이 표를 같이 고쳐야 해요.
 */
const PROCESSORS = [
  {
    name: 'Vercel Inc.',
    country: '미국',
    purpose: '사이트 호스팅',
    items: 'IP 주소, 접속 기록',
  },
  {
    name: 'Supabase Inc.',
    country: '해외 (리전에 따름)',
    purpose: '글·일정·이미지 저장',
    items: '운영자 계정 정보',
  },
  {
    name: 'GitHub, Inc.',
    country: '미국',
    purpose: '댓글 저장 (giscus · Discussions)',
    items: 'GitHub 계정 이름, 댓글 내용, IP 주소',
  },
  {
    name: 'Google LLC',
    country: '미국',
    purpose: '배경음악 재생 (YouTube)',
    items: 'IP 주소, 재생 기록',
  },
  {
    name: 'jsDelivr',
    country: '해외',
    purpose: '글꼴 전송',
    items: 'IP 주소',
  },
];

const REMEDIES = [
  ['개인정보분쟁조정위원회', '1833-6972', 'www.kopico.go.kr'],
  ['개인정보침해신고센터', '118', 'privacy.kisa.or.kr'],
  ['대검찰청 사이버수사과', '1301', 'www.spo.go.kr'],
  ['경찰청 사이버수사국', '182', 'ecrm.police.go.kr'],
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <Container>
      <div className="flex flex-col gap-12 pb-6">
        <section>
          <p className="text-xs tracking-[0.22em] text-ink-muted">PRIVACY</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            개인정보 처리방침
          </h1>
          <p className="mt-5 leading-relaxed text-ink-soft">
            개인이 혼자 운영하는 블로그입니다. 회원가입이 없고, 방문자에게 직접
            무언가를 입력받지 않습니다. 그래도 사이트를 여는 것만으로 남는
            기록이 있어서, 무엇이 어디로 가는지 적어둡니다.
          </p>
        </section>

        <Section title="1. 처리하는 개인정보와 목적">
          <p>
            <strong className="font-semibold text-ink">
              방문할 때 자동으로 남는 것
            </strong>{' '}
            — 호스팅 업체(Vercel)의 접속 기록에 IP 주소, 접속 시각, 브라우저
            정보가 남습니다. 사이트를 띄우고 장애를 확인하는 데 쓰입니다.
          </p>
          <p>
            <strong className="font-semibold text-ink">댓글</strong> — 댓글을
            남기려면 GitHub 로그인이 필요합니다. GitHub 계정 이름과 댓글 내용이
            공개되며, 저장은 GitHub Discussions에서 이뤄집니다.
          </p>
          <p>
            <strong className="font-semibold text-ink">문의</strong> — 메일로
            연락을 주시면 그 메일 주소와 내용이 제 메일함에 남습니다.
          </p>
          <p>
            방문자 분석 도구(Google Analytics 등)를 붙이지 않았습니다. 광고와
            광고용 추적 스크립트도 없습니다. 누가 몇 번 왔는지 저는 알 수
            없습니다.
          </p>
        </Section>

        <Section title="2. 보유 기간과 파기">
          <p>
            접속 기록은 호스팅 업체의 보관 정책에 따라 자동으로 지워집니다. 제가
            따로 내려받아 보관하지 않습니다.
          </p>
          <p>
            댓글은 지우기 전까지 GitHub에 남습니다. 본인이 쓴 댓글은 본인이 직접
            지울 수 있습니다.
          </p>
          <p>
            메일 문의는 용건이 끝나면 지웁니다. 남겨둘 이유가 없어졌는데도 남아
            있다면 알려주세요.
          </p>
        </Section>

        <Section title="3. 처리 위탁과 국외 이전">
          <p>
            아래 서비스를 쓰고 있고, 전부 해외 사업자입니다. 즉 위 정보는
            국외에서 처리·보관됩니다. 각 항목의 처리는 해당 업체의 처리방침을
            따릅니다.
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-muted">
                  <th className="py-2 pr-4 font-normal">받는 곳</th>
                  <th className="py-2 pr-4 font-normal">국가</th>
                  <th className="py-2 pr-4 font-normal">목적</th>
                  <th className="py-2 font-normal">항목</th>
                </tr>
              </thead>
              <tbody>
                {PROCESSORS.map((p) => (
                  <tr key={p.name} className="border-b border-line align-top">
                    <td className="py-3 pr-4 font-medium text-ink">{p.name}</td>
                    <td className="py-3 pr-4">{p.country}</td>
                    <td className="py-3 pr-4">{p.purpose}</td>
                    <td className="py-3">{p.items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            배경음악은 재생 버튼을 누르기 전까지 유튜브에 아무 요청도 보내지
            않습니다. 광고 추적이 적은 youtube-nocookie 주소를 씁니다.
          </p>
        </Section>

        <Section title="4. 브라우저에 저장되는 것">
          <p>
            다크 모드 설정과 음악 재생 여부를 브라우저 안(localStorage)에
            저장합니다. 다음에 왔을 때 같은 상태로 보여주려는 용도이고, 제
            서버로 전송되지 않습니다. 광고나 분석 목적의 쿠키는 쓰지 않습니다.
          </p>
          <p>
            브라우저 설정에서 사이트 데이터를 지우면 함께 사라집니다. 저장을
            원하지 않으면 브라우저의 사이트 데이터 차단 기능을 쓰시면 됩니다.
            차단해도 글을 읽는 데는 지장이 없고, 테마와 음악 설정만 기억되지
            않습니다.
          </p>
        </Section>

        <Section title="5. 정보주체의 권리">
          <p>
            개인정보 보호법 제35조부터 제37조에 따라 본인의 개인정보에 대해
            열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 아래 연락처로
            알려주시면 지체 없이 처리하겠습니다.
          </p>
          <p>
            댓글은 GitHub 계정으로 본인이 직접 지우는 것이 가장 빠릅니다. 제가
            대신 지워야 하는 경우에도 연락 주시면 처리합니다.
          </p>
        </Section>

        <Section title="6. 안전성 확보 조치">
          <p>
            글·일정·이미지를 쓰고 지우는 권한은 데이터베이스의 접근 제어
            정책(Row Level Security)으로 검사합니다. 브라우저 쪽 코드를 고쳐도
            우회되지 않습니다.
          </p>
          <p>
            모든 연결은 HTTPS로만 이뤄지고, 응답에 보안 헤더를 붙여 프레임
            삽입과 타입 추측을 막습니다. 이미지 업로드는 실제 파일 타입과 크기를
            확인합니다.
          </p>
        </Section>

        <Section title="7. 개인정보 보호책임자">
          <p>
            {siteAuthor} ·{' '}
            <a
              href={`mailto:${siteEmail}`}
              className="underline underline-offset-4 transition-colors hover:text-ink"
            >
              {siteEmail}
            </a>
          </p>
          <p>개인정보와 관련한 문의, 불만, 피해 구제는 위 주소로 보내주세요.</p>
        </Section>

        <Section title="8. 권익침해 구제 방법">
          <p>아래 기관에 분쟁 해결이나 상담을 신청할 수 있습니다.</p>
          <ul className="mt-1 flex flex-col gap-2 text-sm">
            {REMEDIES.map(([name, tel, site]) => (
              <li key={name} className="flex flex-wrap gap-x-3">
                <span className="font-medium text-ink">{name}</span>
                <span className="tabular-nums">{tel}</span>
                <span className="text-ink-muted">{site}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="9. 방침 변경">
          <p>
            내용이 바뀌면 이 페이지에 바로 반영하고 아래 시행일을 고칩니다.
            중요한 변경은 최소 7일 전에 이 페이지에 알립니다.
          </p>
          <p className="text-sm text-ink-muted">시행일: {EFFECTIVE_DATE}</p>
        </Section>
      </div>
    </Container>
  );
}
