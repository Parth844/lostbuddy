import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import notificationsData from "@/data/notifications.json";
import { formatDistanceToNow } from "date-fns";

// ✅ Safe notification type
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  priority: string;
  read: boolean;
  case_id?: string;
}

const Notifications = () => {
  // ✅ Defensive fallback (production safe)
  const notifications: Notification[] = Array.isArray(notificationsData)
    ? notificationsData
    : [];

  const getIcon = (type: string) => {
    switch (type) {
      case "match":
        return <UserCheck className="h-5 w-5 text-warning" />;
      case "verification":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "new_case":
        return <FileText className="h-5 w-5 text-primary" />;
      case "reunited":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "update":
        return <AlertCircle className="h-5 w-5 text-accent" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-destructive";
      case "medium":
        return "border-l-4 border-l-warning";
      default:
        return "border-l-4 border-l-muted";
    }
  };

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Notifications
              </h1>
              <p className="text-muted-foreground">
                Stay updated on your cases and matches
              </p>
            </div>
            <Button variant="outline" size="sm">
              Mark All as Read
            </Button>
          </div>

          {/* UNREAD */}
          {unread.length > 0 && (
            <div className="space-y-4 mb-8">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5" />
                New Notifications
              </h2>

              {unread.map((notification, index) => (
                <Card
                  key={notification.id}
                  className={`p-4 hover:shadow-md transition-all animate-fade-in ${getPriorityColor(
                    notification.priority
                  )}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {formatDistanceToNow(
                            new Date(notification.timestamp),
                            { addSuffix: true }
                          )}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>

                      <div className="flex gap-2">
                        {notification.case_id && (
                          <Link to={`/cases/${notification.case_id}`}>
                            <Button variant="outline" size="sm">
                              View Case
                            </Button>
                          </Link>
                        )}
                        <Button variant="ghost" size="sm">
                          Mark as Read
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* READ */}
          {read.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Earlier
              </h2>

              {read.map((notification) => (
                <Card
                  key={notification.id}
                  className="p-4 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(notification.timestamp),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      {notification.case_id && (
                        <Link to={`/cases/${notification.case_id}`}>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto"
                          >
                            View Case →
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* EMPTY */}
          {notifications.length === 0 && (
            <Card className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Notifications Yet
              </h3>
              <p className="text-muted-foreground">
                You'll see notifications here when there are updates on your
                cases
              </p>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;
