import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const GREEN = '#1B4332';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#f5f5f0', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary', mb: 3 }}>Back</Button>

        <Typography variant="h3" sx={{ fontWeight: 800, color: GREEN, fontFamily: '"Georgia", serif', mb: 1 }}>
          Terms of Service
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 4 }}>Last updated: March 24, 2026</Typography>

        <Divider sx={{ mb: 4 }} />

        {[
          {
            title: '1. Acceptance of Terms',
            content: 'By accessing or using CommunityVault ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all the terms and conditions, you may not access or use the Service. These Terms apply to all visitors, users, and others who access or use the Service.',
          },
          {
            title: '2. Description of Service',
            content: 'CommunityVault is a cloud-based homeowner association management platform that provides tools for property management, financial tracking, violation management, work orders, meetings, document management, and related community management functions. The Service is provided on a software-as-a-service basis.',
          },
          {
            title: '3. User Accounts',
            content: 'You must provide accurate, complete, and current information when creating an account. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.',
          },
          {
            title: '4. Multi-Tenant Architecture',
            content: 'CommunityVault operates on a multi-tenant architecture. Each community\'s data is logically isolated. You agree not to attempt to access data belonging to other communities or users. Unauthorized access attempts may result in immediate account termination and legal action.',
          },
          {
            title: '5. Acceptable Use',
            content: 'You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to: (a) use the Service in any way that violates any applicable law or regulation; (b) transmit any material that is defamatory, obscene, or otherwise objectionable; (c) attempt to interfere with or disrupt the Service; (d) attempt to gain unauthorized access to any portion of the Service; (e) use the Service to store or transmit malicious code.',
          },
          {
            title: '6. Data Ownership',
            content: 'You retain all rights to the data you input into CommunityVault. We do not claim ownership of your data. We will not access, use, or share your data except as necessary to provide the Service, comply with the law, or as otherwise described in our Privacy Policy. You may export your data at any time.',
          },
          {
            title: '7. Payment Terms',
            content: 'Certain features of the Service require payment. You agree to pay all fees associated with your chosen plan. Fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days\' notice. Failure to pay may result in suspension or termination of your account.',
          },
          {
            title: '8. Limitation of Liability',
            content: 'To the maximum extent permitted by law, CommunityVault shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, or goodwill. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.',
          },
          {
            title: '9. Termination',
            content: 'We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease. You may request an export of your data within 30 days of termination.',
          },
          {
            title: '10. Changes to Terms',
            content: 'We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.',
          },
          {
            title: '11. Contact',
            content: 'If you have any questions about these Terms, please contact us at legal@communityvault.com.',
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
