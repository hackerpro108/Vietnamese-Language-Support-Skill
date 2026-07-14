/**
 * P3.1: IT/Dev Domain Corpus
 * Technical vocabulary that should be protected from mixing detection stripping
 * and domain-specific word replacements for Vietnamese IT/Dev context
 */

export const IT_VOCAB = {
  // Technical terms that should NEVER be stripped by mixing detector
  protectedTerms: [
    'API', 'REST', 'GraphQL', 'gRPC', 'WebSocket', 'HTTP', 'HTTPS', 'TCP', 'UDP',
    'JSON', 'XML', 'YAML', 'TOML', 'SQL', 'NoSQL', 'Redis', 'PostgreSQL', 'MySQL',
    'MongoDB', 'Docker', 'Kubernetes', 'K8s', 'Helm', 'CI', 'CD', 'CI/CD',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'npm', 'Yarn', 'PNPM', 'Bun', 'Deno',
    'NodeJS', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'Kotlin',
    'React', 'Vue', 'NextJS', 'Nuxt', 'Svelte', 'Angular', 'Vite', 'Webpack',
    'VionSky', 'OpenClaw', 'Nemotron', 'Gemma', 'Ollama', 'Prisma', 'ORM',
    'JWT', 'OAuth', 'OIDC', 'SAML', 'LDAP', 'RBAC', 'ABAC', 'SSO', 'MFA',
    'AWS', 'GCP', 'Azure', 'VPC', 'IAM', 'S3', 'EC2', 'Lambda', 'RDS', 'CloudFormation',
    'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'Loki', 'Tempo', 'Jaeger',
    'Microservice', 'Monolith', 'Serverless', 'Edge', 'CDN', 'DNS', 'SSL', 'TLS',
    'WebRTC', 'QUIC', 'HTTP2', 'HTTP3', 'gRPC-web', 'tRPC', 'React Query', 'SWR',
    'Zustand', 'Redux', 'Context API', 'Hooks', 'SSR', 'SSG', 'ISR', 'CSR',
    'Monorepo', 'Turborepo', 'Nx', 'pnpm-workspace', 'Changesets', 'Semver',
    'ESLint', 'Prettier', 'TypeScript', 'TSConfig', 'Jest', 'Vitest', 'Cypress',
    'Playwright', 'Storybook', 'Chromatic', 'Vercel', 'Netlify', 'Cloudflare Pages'
  ],
  
  // Domain-specific word replacements (casual -> formal/standard)
  wordReplacements: {
    'cài': 'cài đặt',
    'xóa': 'xoá', 
    'sửa': 'chỉnh sửa',
    'chạy': 'chạy thử',
    'build': 'build dự án',
    'deploy': 'triển khai',
    'debug': 'gỡ lỗi',
    'fix': 'sửa lỗi',
    'refactor': 'tái cấu trúc',
    'optimize': 'tối ưu hóa',
    'scale': 'mở rộng quy mô',
    'monitor': 'giám sát',
    'log': 'nhật ký',
    'error': 'lỗi',
    'bug': 'lỗi phần mềm',
    'feature': 'tính năng',
    'ticket': 'vé yêu cầu',
    'PR': 'pull request',
    'MR': 'merge request',
    'commit': 'commit mã',
    'push': 'đẩy mã',
    'pull': 'kéo mã',
    'merge': 'gộp mã',
    'branch': 'nhánh',
    'repo': 'kho mã',
    'localhost': 'máy cục bộ',
    'production': 'môi trường sản xuất',
    'staging': 'môi trường dự bị',
    'dev': 'môi trường phát triển',
    'test': 'môi trường kiểm thử'
  },
  
  // Formal to casual for dev context
  formalToCasual: {
    'Tôi đang triển khai': ['Mình đang deploy', 'Mình push production'],
    'Tôi cần gỡ lỗi': ['Mình cần debug', 'Mình fix bug'],
    'Tôi viết mã': ['Mình code', 'Mình viết code'],
    'Tôi kiểm tra': ['Mình test', 'Mình chạy test'],
    'Tôi tối ưu hóa': ['Mình optimize', 'Mình tune performance'],
    'Kho mã này': ['Repo này', 'Project này'],
    'Môi trường sản xuất': ['Prod', 'Production'],
    'Môi trường phát triển': ['Dev', 'Local'],
    'Yêu cầu kéo mã': ['PR', 'Pull request'],
    'Gộp mã': ['Merge', 'Merge request']
  }
};

export function getITDomainConfig() {
  return {
    domain: 'it',
    protectedTerms: IT_VOCAB.protectedTerms,
    wordReplacements: IT_VOCAB.wordReplacements,
    formalToCasual: IT_VOCAB.formalToCasual
  };
}