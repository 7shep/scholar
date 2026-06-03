import { CheckCircle2, Circle, Clock3, TrendingUp } from "lucide-react";
import { useReveal } from "../useReveal";
import { difficultyClass, gradeStandings, upcomingTasks } from "./shared";

export function AppScreenshots({
  dotsY,
  backdropY,
  frontY,
}: {
  dotsY: number;
  backdropY: number;
  frontY: number;
}) {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`showcase section-reveal${visible ? " is-visible" : ""}`}
      style={{ backgroundPosition: `0 ${dotsY}px` }}
    >
      <div className="container showcase__inner">
        <h2>Everything in one place.</h2>
        <p>A beautiful, intuitive desktop experience designed specifically for students.</p>
        <div className="showcase-stack" aria-hidden="true">
          <article
            className={`showcase-window showcase-window--back${visible ? " is-visible" : ""}`}
            style={{ transform: `translate3d(-30px, ${backdropY + (visible ? 0 : 58)}px, 0)` }}
          >
            <div className="window-bar window-bar--showcase">
              <span />
              <span />
              <span />
              <div className="window-title">Grades - Scholar</div>
            </div>
            <div className="showcase-window__content showcase-window__content--grades">
              <div className="grades-heading">
                <h4>Current Standings</h4>
                <div className="grades-gpa">
                  <TrendingUp size={14} />
                  GPA: 3.8
                </div>
              </div>
              <div className="grades-list">
                {gradeStandings.map((course) => (
                  <div key={course.name} className="grade-card">
                    <div className="grade-card__meta">
                      <span>{course.name}</span>
                      <strong>{course.grade}</strong>
                    </div>
                    <div className="grade-track">
                      <span className={course.barClass} style={{ width: course.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article
            className={`showcase-window showcase-window--front${visible ? " is-visible" : ""}`}
            style={{ transform: `translate3d(0, ${frontY + (visible ? 0 : 86)}px, 0)` }}
          >
            <div className="window-bar window-bar--showcase">
              <span />
              <span />
              <span />
              <div className="window-title">Dashboard - Scholar</div>
            </div>
            <div className="showcase-window__content showcase-window__content--dashboard">
              <aside className="focus-sidebar">
                <div />
                <div className="is-active" />
                <div />
                <div />
              </aside>
              <section className="focus-content">
                <h4>Up Next</h4>
                {upcomingTasks.map((task) => (
                  <article key={`showcase-${task.title}`} className="task-card task-card--showcase">
                    {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    <div>
                      <h4 className={task.completed ? "is-crossed" : ""}>{task.title}</h4>
                      <p>
                        <span>{task.course}</span>
                        <Clock3 size={12} />
                        <span>{task.due}</span>
                      </p>
                    </div>
                    <span className={difficultyClass(task.level)}>{task.level}</span>
                  </article>
                ))}
              </section>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
