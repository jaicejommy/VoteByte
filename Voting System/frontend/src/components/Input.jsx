const Input = ({ icon: Icon, theme, ...props }) => {
  return (
    <div className="relative mb-6">
      {/* Icon inside the input */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon
          className={`size-5 transition-colors duration-300 ${
            theme === "dark" ? "text-green-500" : "text-[#3B5BFF]"
          }`}
        />
      </div>

      {/* Input field */}
      <input
        {...props}
        className={`w-full pl-10 pr-3 py-2 rounded-lg border focus:ring-2 transition duration-200 focus:outline-none ${
          theme === "dark"
            ? "bg-gray-800 bg-opacity-50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
            : "bg-[#F8FAFF] border-[#D6E0FF] text-[#1E3A8A] placeholder-[#8B92B8] focus:border-[#3B5BFF] focus:ring-[#3B5BFF]"
        }`}
      />
    </div>
  );
};

export default Input;
