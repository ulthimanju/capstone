/**
 * SkillEdge — An SVG line connecting two nodes in the skill tree.
 *
 * Renders a directional edge with an arrowhead marker.
 * - **locked**: dim border-colored stroke
 * - **unlocked**: brand-colored stroke with a blue glow
 *
 * @param {object}  props
 * @param {{ x: number, y: number }} props.from – Start coordinates
 * @param {{ x: number, y: number }} props.to   – End coordinates
 * @param {boolean} [props.unlocked]  – Whether the edge is unlocked
 * @param {string}  [props.className] – Additional CSS classes on the line
 */
export default function SkillEdge({
  from,
  to,
  unlocked = false,
  className = '',
}) {
  const markerId = unlocked ? 'arrow-unlocked' : 'arrow-locked';

  return (
    <g>
      {/* Arrowhead marker definition */}
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill={unlocked ? '#3b82f6' : '#2a2a2a'}
          />
        </marker>
      </defs>

      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={unlocked ? '#3b82f6' : '#2a2a2a'}
        strokeWidth={2}
        markerEnd={`url(#${markerId})`}
        filter={
          unlocked
            ? 'drop-shadow(0 0 4px rgba(59,130,246,0.4))'
            : undefined
        }
        className={className}
      />
    </g>
  );
}
