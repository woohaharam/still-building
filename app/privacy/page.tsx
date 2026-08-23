import type { Metadata } from 'next';
import Container from '@/components/Container';
import { siteEmail, siteName, siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: `${siteName}이 어떤 정보를 다루고 무엇을 다루지 않는지.`,
  alternates: { canonical: `${siteUrl}/privacy` },
};

const SECTIONS = [
  {
    title: '수집하지 않는 것',
    body: [
      '이 블로그는 회원가입이 없고, 방문자에게 어떤 정보도 입력받지 않아요.',
      '방문자 분석 도구(Google Analytics 등)를 붙이지 않았습니다. 누가 몇 번 왔는지 저는 모릅니다.',
      '광고를 넣지 않았고, 광고용 추적 스크립트도 없습니다.',
    ],
  },
  {
    title: '브라우저에 저장되는 것',
    body: [
      '다크 모드 설정과 음악 플레이어 상태를 브라우저 안(localStorage)에 저장해요. 다음에 왔을 때 같은 상태로 보여주려는 용도이고, 서버로 전송되지 않습니다.',
      '브라우저 설정에서 사이트 데이터를 지우면 함께 사라집니다.',
    ],
  },
  {
    title: '댓글',
    body: [
      '댓글은 giscus를 통해 이 블로그의 GitHub 저장소 Discussions에 저장됩니다. 댓글을 쓰려면 GitHub 로그인이 필요하고, 작성한 내용과 GitHub 계정 이름은 GitHub에 공개됩니다.',
      '본인이 쓴 댓글은 본인이 직접 지울 수 있어요. 저장과 처리는 GitHub의 개인정보 처리방침을 따릅니다.',
    ],
  },
  {
    title: '외부에서 불러오는 것',
    body: [
      '글꼴은 jsDelivr, 댓글은 giscus, 음악은 유튜브에서 불러옵니다. 이 과정에서 해당 서비스에 방문자의 IP 주소가 전달될 수 있어요.',
      '음악은 재생 버튼을 누르기 전에는 유튜브에 아무 요청도 보내지 않고, 광고 추적이 적은 youtube-nocookie 주소를 씁니다.',
    ],
  },
  {
    title: '글과 사진',
    body: [
      '글·일정·사진은 Supabase에 저장되고, 쓰고 지우는 것은 정해진 계정 하나만 할 수 있습니다. 이 검사는 브라우저가 아니라 데이터베이스에서 이뤄집니다.',
    ],
  },
];

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
            개인 블로그라 다루는 정보가 거의 없어요. 그래도 무엇을 하고 무엇을
            하지 않는지 적어둡니다.
          </p>
        </section>

        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-4 text-lg font-semibold">{section.title}</h2>
            <div className="flex flex-col gap-3">
              {section.body.map((line) => (
                <p key={line} className="leading-relaxed text-ink-soft">
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-4 text-lg font-semibold">문의</h2>
          <p className="leading-relaxed text-ink-soft">
            궁금한 점이나 지워달라는 요청은{' '}
            <a
              href={`mailto:${siteEmail}`}
              className="underline underline-offset-4 transition-colors hover:text-ink"
            >
              {siteEmail}
            </a>
            로 보내주세요.
          </p>
        </section>
      </div>
    </Container>
  );
}
