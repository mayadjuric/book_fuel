export function MoodSelector() {
  const moods = ['😫', '😕', '😐', '🙂', '🤩'];

  return (
    <div className="p-6 text-center">
      <h3 className="mb-4 text-lg font-medium">How are you feeling today?</h3>
      <div className="flex justify-center gap-4 text-4xl">
        {moods.map((mood, index) => (
          <button 
            key={index} 
            className="hover:scale-110 transition-transform cursor-pointer bg-transparent border-none p-0"
            onClick={() => console.log('Selected mood:', mood)}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
}
