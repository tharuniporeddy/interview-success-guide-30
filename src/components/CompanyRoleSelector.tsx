import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, BrainCircuit, Users, Play } from "lucide-react";

interface CompanyRoleSelectorProps {
  onStartQuiz: (company: string, role: string) => void;
  loading?: boolean;
}

const companies = [
  "Google",
  "Amazon", 
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Uber",
  "Airbnb",
  "Infosys",
  "TCS",
  "Wipro",
  "Accenture"
];

const roles = [
  { value: "technical", label: "Technical", icon: BrainCircuit },
  { value: "hr", label: "HR", icon: Users }
];

const CompanyRoleSelector = ({ onStartQuiz, loading }: CompanyRoleSelectorProps) => {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleStartQuiz = () => {
    if (selectedCompany && selectedRole) {
      onStartQuiz(selectedCompany, selectedRole);
    }
  };

  const isDisabled = !selectedCompany || !selectedRole || loading;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Building2 className="h-6 w-6" />
          🎯 Let's get you prepared!
        </CardTitle>
        <p className="text-muted-foreground">
          Choose your desired company and the type of interview you'd like to practice for
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">🔹 Company:</label>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger>
              <SelectValue placeholder="Select a company..." />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">🔹 Role Type:</label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Button
                  key={role.value}
                  variant={selectedRole === role.value ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() => setSelectedRole(role.value)}
                >
                  <Icon className="h-5 w-5" />
                  {role.label}
                </Button>
              );
            })}
          </div>
        </div>

        {selectedCompany && selectedRole && (
          <div className="p-4 bg-primary/5 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Selected</Badge>
            </div>
            <p className="text-sm">
              📌 Company: <strong>{selectedCompany}</strong><br/>
              📌 Role: <strong>{selectedRole === "technical" ? "Technical" : "HR"}</strong>
            </p>
          </div>
        )}

        <Button
          onClick={handleStartQuiz}
          disabled={isDisabled}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              🚀 Starting your customized quiz...
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              👇 Start Preparation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanyRoleSelector;