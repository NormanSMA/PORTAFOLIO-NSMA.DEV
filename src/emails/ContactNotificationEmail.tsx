import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import { formatContactReasons, type ContactReasonKey } from '../utils/contact';

interface ContactNotificationEmailProps {
  fullName: string;
  email: string;
  message: string;
  reasons: ContactReasonKey[];
  language: 'es' | 'en';
  receivedAt: string;
}

const pageStyles = {
  body: {
    backgroundColor: '#f5f5f2',
    color: '#111827',
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: 0,
    padding: '24px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #0f766e 100%)',
    color: '#ffffff',
    padding: '32px',
  },
  accent: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.72)',
    margin: '0 0 12px',
  },
  title: {
    fontSize: '28px',
    lineHeight: '34px',
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: '15px',
    lineHeight: '24px',
    color: 'rgba(255,255,255,0.88)',
    margin: '10px 0 0',
  },
  section: {
    padding: '32px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#6b7280',
    margin: '0 0 8px',
  },
  value: {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#111827',
    margin: 0,
  },
  chip: {
    display: 'inline-block',
    marginRight: '8px',
    marginBottom: '8px',
    padding: '8px 12px',
    borderRadius: '999px',
    backgroundColor: '#e0f2fe',
    color: '#075985',
    fontSize: '13px',
    fontWeight: 600,
  },
  quote: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    padding: '20px',
    fontSize: '15px',
    lineHeight: '26px',
    color: '#1f2937',
    whiteSpace: 'pre-wrap' as const,
    margin: 0,
  },
  footer: {
    padding: '20px 32px 32px',
    color: '#6b7280',
    fontSize: '12px',
    lineHeight: '20px',
  },
} as const;

function ContactNotificationEmail({
  fullName,
  email,
  message,
  reasons,
  language,
  receivedAt,
}: ContactNotificationEmailProps) {
  const subject = language === 'es' ? 'Nuevo mensaje desde tu portafolio' : 'New message from your portfolio';
  const reasonsText = reasons.length > 0 ? formatContactReasons(reasons, language) : (language === 'es' ? 'No especificado' : 'Not specified');

  return (
    <Html lang={language}>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={pageStyles.body}>
        <Container style={pageStyles.container}>
          <Section style={pageStyles.header}>
            <Text style={pageStyles.accent}>{language === 'es' ? 'Contacto' : 'Contact'}</Text>
            <Heading style={pageStyles.title}>{subject}</Heading>
            <Text style={pageStyles.subtitle}>{receivedAt}</Text>
          </Section>

          <Section style={pageStyles.section}>
            <Text style={pageStyles.label}>{language === 'es' ? 'Nombre' : 'Name'}</Text>
            <Text style={pageStyles.value}>{fullName}</Text>

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

            <Text style={pageStyles.label}>Email</Text>
            <Text style={pageStyles.value}>
              <Link href={`mailto:${email}`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>
                {email}
              </Link>
            </Text>

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

            <Text style={pageStyles.label}>{language === 'es' ? 'Motivos' : 'Reasons'}</Text>
            <Text style={pageStyles.value}>{reasonsText}</Text>

            <div style={{ marginTop: '12px' }}>
              {reasons.map((reason) => (
                <span key={reason} style={pageStyles.chip}>
                  {formatContactReasons([reason], language)}
                </span>
              ))}
            </div>

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

            <Text style={pageStyles.label}>{language === 'es' ? 'Mensaje' : 'Message'}</Text>
            <Text style={pageStyles.quote}>{message}</Text>
          </Section>

          <Text style={pageStyles.footer}>
            {language === 'es'
              ? 'Este mensaje fue generado desde el formulario de contacto del portfolio.'
              : 'This message was generated from the portfolio contact form.'}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ContactNotificationEmail;