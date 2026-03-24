import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const GREEN = '#1B4332';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#f5f5f0', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary', mb: 3 }}>Back</Button>

        <Typography variant="h3" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif', mb: 1 }}>
          Privacy Policy
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 4 }}>Last updated: March 24, 2026</Typography>

        <Divider sx={{ mb: 4 }} />

        {[
          {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly to us, including: name, email address, phone number, mailing address, property information, financial data related to assessments and payments, and any other information you choose to provide. We also automatically collect certain technical information when you use our Service, including IP address, browser type, device identifiers, and usage data.',
          },
          {
            title: '2. How We Use Your Information',
            content: 'We use the information we collect to: (a) provide, maintain, and improve the Service; (b) process transactions and send related notices; (c) send technical notices, updates, and security alerts; (d) respond to your comments, questions, and requests; (e) communicate about products, services, and events; (f) monitor and analyze trends, usage, and activities; (g) detect, investigate, and prevent fraudulent transactions and unauthorized access.',
          },
          {
            title: '3. Data Sharing',
            content: 'We do not sell, trade, or rent your personal information to third parties. We may share information: (a) with your community\'s authorized administrators and board members as necessary for community management; (b) with service providers who assist in operating our Service; (c) in response to legal process or government request; (d) to protect the rights, property, and safety of CommunityVault, our users, and the public.',
          },
          {
            title: '4. Data Security',
            content: 'We implement industry-standard security measures to protect your data, including: encryption at rest (AES-256) and in transit (TLS 1.3), role-based access controls, regular security audits, automated vulnerability scanning, and secure cloud infrastructure hosted on SOC 2 Type II certified platforms. However, no method of transmission over the Internet is 100% secure.',
          },
          {
            title: '5. Data Retention',
            content: 'We retain your information for as long as your account is active or as needed to provide the Service. We will retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your data at any time, subject to legal retention requirements.',
          },
          {
            title: '6. Multi-Tenant Data Isolation',
            content: 'CommunityVault is a multi-tenant platform. Each community\'s data is logically isolated and accessible only by authorized users of that community. We employ strict access controls and audit logging to ensure data isolation between communities.',
          },
          {
            title: '7. Your Rights',
            content: 'You have the right to: (a) access the personal information we hold about you; (b) request correction of inaccurate data; (c) request deletion of your data; (d) export your data in a machine-readable format; (e) withdraw consent for data processing; (f) lodge a complaint with a data protection authority. To exercise these rights, contact us at privacy@communityvault.com.',
          },
          {
            title: '8. Cookies and Tracking',
            content: 'We use essential cookies to maintain your session and authentication state. We use analytics cookies to understand how our Service is used. You may control cookie preferences through your browser settings. We do not use third-party advertising cookies.',
          },
          {
            title: '9. Children\'s Privacy',
            content: 'Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete that information.',
          },
          {
            title: '10. Changes to This Policy',
            content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the updated policy.',
          },
          {
            title: '11. Contact Us',
            content: 'If you have questions about this Privacy Policy, please contact us at privacy@communityvault.com.',
          },
        ].map((section) => (
          <Box key={section.title} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN, mb: 1, fontSize: '1.1rem' }}>
              {section.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              {section.content}
            </Typography>
          </Box>
        ))}
      </Container>
    </Box>
  );
}
