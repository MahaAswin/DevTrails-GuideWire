import React from 'react';
import { Zap, Clock, HeadphonesIcon, Stethoscope, Gift, Shield } from 'lucide-react';

const BenefitCard = ({ title, description, icon: Icon, highlight }) => {
  return (
    <div className="group flex flex-col items-start bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer h-full relative overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-1000"></div>
      
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8 group-hover:rotate-12 transition-transform ring-1 ring-emerald-500/20">
        <Icon size={28} />
      </div>
      
      <h3 className="text-2xl font-black italic tracking-tighter dark:text-white mb-3 uppercase">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-1 font-medium italic">
        "{description}"
      </p>

      {highlight && (
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl ring-1 ring-emerald-500/20">
          {highlight}
        </div>
      )}
    </div>
  );
};

const WorkerBenefits = () => {
  const benefits = [
    { title: "Priority Claims Processing", description: "Our AI systems instantly verify triggers for premium gig workers, depositing funds directly to your wallet within 6 hours of the disruption.", icon: Zap, highlight: "Instant Payout" },
    { title: "Extra Coverage Hours", description: "Your protection extends 2 hours past your official shift end time, ensuring you're covered during your ride home.", icon: Clock },
    { title: "24/7 Emergency Support", description: "Direct access to our rapid-response team during critical emergencies, city curfews, or platform outages.", icon: HeadphonesIcon },
    { title: "Accident Medical Support", description: "Up to ₹50,000 in immediate hospitalization coverage guaranteed regardless of fault during active shifts.", icon: Stethoscope, highlight: "No Deductible" },
    { title: "Loyalty Cashback", description: "Get a 15% discount on next week's premium if no claims are filed. Keep your safety score high to earn more.", icon: Gift },
    { title: "Family Protection Shield", description: "Add a registered family member to a micro-policy for unexpected medical needs.", icon: Shield },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Protocol<br/>Privileges</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Exclusive advantages and premium features for verified ShieldGig members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map(benefit => (
          <BenefitCard key={benefit.title} {...benefit} />
        ))}
      </div>
    </div>
  );
};

export default WorkerBenefits;
