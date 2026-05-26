/**
 * ChatBubble — A single message bubble in the chat interface.
 *
 * - **user** messages align right with brand-muted background
 * - **ai** messages align left with surface background and optional
 *   source-reference pills
 *
 * @param {object}   props
 * @param {string}   props.message     – Message text
 * @param {'user'|'ai'} props.sender   – Who sent the message
 * @param {Array<{ name: string }>} [props.sources] – Source references (AI only)
 * @param {string}   [props.timestamp] – Formatted time string
 * @param {string}   [props.className]
 */
export default function ChatBubble({
  message,
  sender = 'user',
  sources,
  timestamp,
  className = '',
}) {
  const isUser = sender === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}
    >
      <div
        className={`px-4 py-3 max-w-[75%] ${
          isUser
            ? 'bg-brand-muted text-text-primary rounded-2xl rounded-br-md'
            : 'bg-surface text-text-primary rounded-2xl rounded-bl-md'
        }`}
      >
        {/* Message body */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>

        {/* Timestamp */}
        {timestamp && (
          <span className="block text-xs text-text-disabled mt-1">
            {timestamp}
          </span>
        )}

        {/* Source pills (AI only) */}
        {!isUser && sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {sources.map((src, i) => (
              <button
                key={`${src.name}-${i}`}
                type="button"
                className="border border-border text-xs text-text-muted rounded-full px-2 py-0.5 hover:border-brand hover:text-brand cursor-pointer transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                {src.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
