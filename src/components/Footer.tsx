import Link from 'next/link';
import { Youtube, Instagram, Send, Phone, Mail } from 'lucide-react';

const VkontakteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-6 h-6 transform scale-125" fill="currentColor" viewBox="0 0 32 32">
        <path d="M 9.082031 5 C 6.839844 5 5 6.839844 5 9.082031 L 5 22.917969 C 5 25.160156 6.839844 27 9.082031 27 L 22.917969 27 C 25.160156 27 27 25.160156 27 22.917969 L 27 9.082031 C 27 6.839844 25.160156 5 22.917969 5 Z M 9.082031 7 L 22.917969 7 C 24.078125 7 25 7.921875 25 9.082031 L 25 22.917969 C 25 24.078125 24.078125 25 22.917969 25 L 9.082031 25 C 7.921875 25 7 24.078125 7 22.917969 L 7 9.082031 C 7 7.921875 7.921875 7 9.082031 7 Z M 15.71875 12.230469 C 14.984375 12.222656 14.359375 12.230469 14.007813 12.402344 C 13.773438 12.515625 13.59375 12.773438 13.703125 12.785156 C 13.839844 12.804688 14.148438 12.871094 14.3125 13.09375 C 14.523438 13.378906 14.515625 14.023438 14.515625 14.023438 C 14.515625 14.023438 14.632813 15.796875 14.230469 16.019531 C 13.953125 16.171875 13.574219 15.863281 12.753906 14.453125 C 12.335938 13.726563 12.019531 12.925781 12.019531 12.925781 C 12.019531 12.925781 11.960938 12.777344 11.851563 12.699219 C 11.71875 12.601563 11.535156 12.570313 11.535156 12.570313 L 9.578125 12.582031 C 9.578125 12.582031 9.285156 12.59375 9.179688 12.71875 C 9.082031 12.835938 9.171875 13.066406 9.171875 13.066406 C 9.171875 13.066406 10.703125 16.648438 12.4375 18.453125 C 14.027344 20.109375 15.832031 20 15.832031 20 L 16.652344 20 C 16.652344 20 16.898438 19.972656 17.023438 19.839844 C 17.140625 19.714844 17.136719 19.480469 17.136719 19.480469 C 17.136719 19.480469 17.121094 18.382813 17.628906 18.21875 C 18.132813 18.0625 18.773438 19.28125 19.457031 19.75 C 19.976563 20.105469 20.371094 20.027344 20.371094 20.027344 L 22.199219 20 C 22.199219 20 23.152344 19.941406 22.699219 19.1875 C 22.664063 19.128906 22.4375 18.632813 21.34375 17.617188 C 20.195313 16.554688 20.347656 16.726563 21.730469 14.886719 C 22.570313 13.765625 22.90625 13.082031 22.800781 12.785156 C 22.699219 12.507813 22.082031 12.582031 22.082031 12.582031 L 20.023438 12.59375 C 20.023438 12.59375 19.871094 12.574219 19.757813 12.640625 C 19.648438 12.707031 19.578125 12.863281 19.578125 12.863281 C 19.578125 12.863281 19.25 13.730469 18.816406 14.46875 C 17.902344 16.023438 17.53125 16.109375 17.382813 16.011719 C 17.035156 15.785156 17.121094 15.105469 17.121094 14.625 C 17.121094 13.113281 17.351563 12.488281 16.675781 12.324219 C 16.453125 12.269531 16.289063 12.234375 15.71875 12.230469 Z"></path>
    </svg>
);

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <li>
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
      {children}
    </a>
  </li>
);

export default function Footer() {
  const socialLinks = [
    { href: 'https://vk.com/tk_irbis', icon: <VkontakteIcon />, label: 'ВКонтакте' },
    { href: 'https://t.me/irbis_30', icon: <Send size={24} />, label: 'Telegram' },
    { href: 'https://www.youtube.com/@irbis30', icon: <Youtube size={24} />, label: 'YouTube' },
    { href: 'https://www.instagram.com/irbis_30/', icon: <Instagram size={24} />, label: 'Instagram' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">Ирбис</h3>
            <p className="text-gray-400 max-w-md">
              Клуб энтузиастов, объединенных страстью к приключениям, исследованиям и красоте дикой природы.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Навигация</h4>
            <ul className="space-y-3">
              <li><Link href="/archive/hikes" className="text-gray-400 hover:text-white transition-colors">Походы</Link></li>
              <li><Link href="/articles" className="text-gray-400 hover:text-white transition-colors">Статьи</Link></li>
              <li><Link href="/news" className="text-gray-400 hover:text-white transition-colors">Новости</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">О клубе</Link></li>
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Мы в соцсетях</h4>
            <ul className="space-y-3">
              {socialLinks.map(link => (
                <FooterLink key={link.label} href={link.href}>
                  {link.icon} {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Связь с нами</h4>
            <ul className="space-y-3">
              <FooterLink href="tel:+79064586683">
                <Phone size={24} /> +7 (906) 458-66-83
              </FooterLink>
              <FooterLink href="mailto:support@tkirbis30.ru">
                <Mail size={24} /> support@tkirbis30.ru
              </FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Турклуб Ирбис. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

