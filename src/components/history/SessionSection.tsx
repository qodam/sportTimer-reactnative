import { SessionRow } from "@/src/components/history/SessionRow";
import { QText } from "@/src/components/QText";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import { Session } from "@/src/types";
import { StyleSheet, View } from "react-native";

interface Props {
  title: string;
  sessions: Session[];
  onDelete: (id: string) => void;
}

/** Un groupe de séances (« Cette semaine », « Avant »). Rien n'est affiché s'il est vide. */
export function SessionSection({ title, sessions, onDelete }: Props) {
  const styles = useThemedStyles(makeStyles);
  if (sessions.length === 0) return null;

  return (
    <View style={styles.section}>
      <QText variant="label" style={styles.header}>
        {title}
      </QText>
      <View style={styles.list}>
        {sessions.map((s, i) => (
          <SessionRow
            key={s.id}
            session={s}
            last={i === sessions.length - 1}
            onDelete={() => onDelete(s.id)}
          />
        ))}
      </View>
    </View>
  );
}

const makeStyles = ({ colors, SCALE: S }: Theme) =>
  StyleSheet.create({
    section: { gap: 8, marginTop: 8 },
    header: { fontSize: 13 * S, marginLeft: 16 },
    list: {
      borderRadius: 16,
      backgroundColor: colors.card,
      overflow: "hidden",
    },
  });
