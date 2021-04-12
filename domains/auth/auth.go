package auth

type Token struct {
	AuthToken    string       `json:"token"`
	Expiration   string       `json:"expiration"`
	RefreshToken RefreshToken `json:"refreshToken"`
}

type TokenWithPrivilegeTitleExposed struct {
	Token
	PrivilegeTitle string // Only purpose is to let the frontend code know the privilege. Not a security vulnerability since the info is also in token.
}

type RefreshToken struct {
	RefreshToken string `json:"refreshToken"`
	Expiration   string `json:"expiration"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken"`
}

