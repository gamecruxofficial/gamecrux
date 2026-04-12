const BorderButton = ({children}:{
  children: React.ReactNode;
}) => {
  return (
    <button className="rounded-2xl border-2 bg-purple-600 hover:bg-purple-700 border-black px-6 py-3 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-2xl hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none">
      {children}
    </button>
  );
};

export default BorderButton;