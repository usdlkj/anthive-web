"use client";

interface DefaultCredentialProps {
  environment: string;
  credential?: string;
  onChange: (value: string) => void;
}

const DefaultCredential: React.FC<DefaultCredentialProps> = ({ environment, credential = "", onChange }) => {
  return (
    <div className="bg-white rounded-xl p-6 space-y-4 border border-gray-200">
      <h2 className="text-lg text-gray-500 text-center">
        {environment}
      </h2>

      {/* Credential */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Credential</label>
        <textarea
          defaultValue={credential ? JSON.stringify(credential, null, 2) : ''}
          rows={5}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange(parsed);
            } catch (err) {
              console.error("Invalid JSON in credential textarea");
            }
          }}
          className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default DefaultCredential;