import React from 'react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export const TestimonialSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Music Creator',
      content: 'Kakraba has transformed how I share my music. My fans love having direct access to my content, and I love the control I have over pricing and distribution.',
      avatar: '🎵',
    },
    {
      name: 'Mike Chen',
      role: 'Video Creator',
      content: 'The analytics are incredible. I can see exactly what content resonates with my audience and adjust my strategy accordingly. Revenue is up 300%!',
      avatar: '🎬',
    },
    {
      name: 'Emma Davis',
      role: 'Fan & Supporter',
      content: 'I love that I can actually own the content I purchase. No more worrying about subscriptions ending or content disappearing. It\'s mine forever!',
      avatar: '💜',
    },
    {
      name: 'Alex Rodriguez',
      role: 'Podcast Creator',
      content: 'The platform is so easy to use. I uploaded my entire podcast library in an afternoon, and my fans were able to access it immediately.',
      avatar: '🎙️',
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-900/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Loved by Creators and Fans
          </h2>
          <p className="text-xl text-gray-300">
            Join thousands who are already part of the Kakraba community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
